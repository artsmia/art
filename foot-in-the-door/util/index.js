/** @format */
import { useState, useEffect } from 'react'
export { getMiaExhibitionData } from './getMiaExhibitionData'

export function getImageSrc(artworkData, thumbnail = true) {
  const { id, accession_number } = artworkData
  const isFitD = Boolean(accession_number.match(/FITD/))
  const useIIIF = false // use options = {}?

  if (isFitD) {
    const imageFilename = artworkData.image
    const thumb =
      'tn_' +
      imageFilename.replace(/jpeg|png|JPG|tiff?$/i, 'jpg').replace('+', '%2B')
    // const bucket = Math.ceil(Math.max(id - 1, 1) / 135)
    // const image = `${bucket}/${imageFilename}`
    const useCloudfront = true
    const domain = useCloudfront
      ? `https://d3dbbvm3mhv3af.cloudfront.net`
      : `https://foot-in-the-door-2020.s3.amazonaws.com`

    return `${domain}/800/${thumb}`
  } else if (useIIIF) {
    return `https://iiif.dx.artsmia.org/${id}.jpg/full/${
      thumbnail ? 400 : 800
    },/0/default.jpg`
  } else {
    return `https://${id % 7}.api.artsmia.org/${
      thumbnail ? 400 : 800
    }/${id}.jpg`
  }
}

export function getImageProps(artData, options = {}) {
  const { fullSize } = options

  const valid = artData.image === 'valid'
  // TODO is this the right place to be setting styles?
  const style = valid
    ? {}
    : {
        background:
          'url(https://collections.artsmia.org/images/no-image-bg.png) repeat top left',
        width: '100%',
        height: '37vh',
        display: 'block',
        padding: '1em',
        textAlign: 'center',
      }

  return {
    src: getImageSrc(artData, !fullSize),
    alt: artData.description,
    width: artData.image_width,
    height: artData.image_height,
    valid,
    style,
  }
}

// TODO port this to an API function?
// Nevermind, getStaticProps isn't supposed to call local api routes…
// so maybe api/imagesForCarousel should be moved here
// maybe create an auxiliary search api route anyway?
export async function getSearchResults(term, options = {}) {
  const {
    size, // how many results to fetch
    useNormalSearch, // use a "normal" search or "random". Default: random
    from: _from,
    ids,
    isFitD = true,
  } = options

  const from = _from || 0
  const queryParams = `size=${size || 30}&from=${from}&fitd=${isFitD ? 1 : 0}`
  const searchEndpoint = (term) =>
    `https://search.artsmia.org/${term}?${queryParams}`
  const randomEndpoint = (term) =>
    `https://search.artsmia.org/random/art?q=${term}&${queryParams}`
  const idEndpoint = (ids) => `https://search.artsmia.org/ids/${ids.join(',')}`

  const res = await fetch(
    useNormalSearch
      ? searchEndpoint(term)
      : ids
      ? idEndpoint(ids.slice(0, size || 30))
      : randomEndpoint(term)
  )
  let results = await res.json()

  if (ids) results = results.hits.hits

  return results
}

export async function fetchById(id, isFitD = true) {
  const res = await fetch(
    `https://search.artsmia.org/id/${id}${isFitD ? '?fitd=1' : ''}`
  )
  const artwork = await res.json()

  return artwork
}

export const classifications = [
  'Ceramics',
  'Paintings',
  'Photography',
  'Drawings',
  'Prints',
  'Sculpture',
  'Textiles',
  'Mixed Media',
]

const isDev = false // TODO env var? Next magic var?
const searchEndpoint = isDev
  ? `http://localhost:4680`
  : `https://search.artsmia.org`
export async function likeArtwork(id) {
  if (isNaN(id)) return // console.error('non-numeric artwork ID')

  const surveyEndpoint = `${searchEndpoint}/survey/art/fitd|${id}/like?subset=fitd`
  const res = await fetch(surveyEndpoint, {
    credentials: 'include',
  })
  const text = await res.text()

  saveToLocalStorage({ likes: id })

  return text
}

export async function getUserLikes(options = {}) {
  const surveyEndpoint = `${searchEndpoint}/survey/favorites`
  const { idsOnly, localOnly } = options

  const localData = JSON.parse(localStorage?.getItem('artsmia-fitd') || '{}')
  if (localOnly) return localData.likes || []

  const res = await fetch(surveyEndpoint, {
    credentials: 'include',
  })
  const { userId, likes } = await res.json()

  const ids = [
    ...new Set([
      ...likes.map((id) => Number(id.replace('fitd|', ''))),
      ...(localData.likes || []),
    ]),
  ]
    .filter((item) => item)
    .join(',')

  if (idsOnly) return ids.split(',').map((id) => Number(id))

  if (ids.length === 0) return { userId, likes, artworkResults: null }
  const artworkData = await fetch(
    `https://search.artsmia.org/ids/${ids}?fitd=1`
  )
  const artworkResults = await artworkData.json()

  // also get likes from localstorage?

  return {
    userId,
    likes,
    artworkResults,
  }
}

export async function updateSurvey(data, userId) {
  // is it a good idea to pass `userId` as an unsecured param?
  // Could the data get mixed up by someone?
  const surveyEndpoint = `${searchEndpoint}/survey/foot-in-the-door-visit?data=${data}&userId=${userId}`
  const res = await fetch(surveyEndpoint, {
    // method: data ? 'PUT' : 'GET',
    credentials: 'include',
  })
  const text = await res.text()

  saveToLocalStorage({ survey: JSON.parse(data), userId })

  return text
}

/** save survey response and artwork likes to localhost
 * as well as off to the server
 */
function saveToLocalStorage(data, _userId) {
  if (!localStorage) return

  const beforeData = JSON.parse(localStorage.getItem('artsmia-fitd') || '{}')
  const userId = _userId || beforeData.userId || data.userId

  const nextLikes = (beforeData.likes || [])
    .concat(data.likes)
    .filter((like) => like)

  const nextData = {
    ...beforeData,
    userId,
    likes: nextLikes,
    survey: {
      ...beforeData.survey,
      ...data.survey,
    },
  }

  // console.info({ data, nextData })
  // debugger

  localStorage.setItem('artsmia-fitd', JSON.stringify(nextData))
}

/**
 * fetch one artwork from each `classification`
 * and return all as json
 */
export async function getImages(size, options = {}) {
  let results

  if (options.groups) {
    results = await Promise.all(
      options.groups.map(async function ({ ids, title }) {
        const json = await getSearchResults(null, {
          ids: ids,
          size: size || 1,
        })

        return json.map((item) => ({
          ...item,
          __group: title,
        }))
      })
    )
  } else {
    results = await Promise.all(
      classifications.map(async function (c) {
        const json = await getSearchResults(`classification:${c}`, {
          size: size || 1,
        })
        return json
      })
    )
  }

  return results
}

/**
 * "chunk" an array (`items`) into sub-arrays of `size`.
 *
 *     [1, 2, 3, 4, 5] % 2 => [[1, 2], [3, 4], [5]]
 *
 * Optionally, attempt to 'balance' the array. Generally this means not leaving 1
 * or 2 entries in the last sub-array, so modifying the size of preceding rows
 * to accomodate. Ideally there could be the same amount of items in each row, but
 * when that doesn't happen the last few rows should have a comparable amount of items.
 *
 * Whenever possible, both the first and the last row should have the same number of items.
 */
export function chunkArray(items, options = {}) {
  const size = Number(options) ? options : options.size || 3
  const fuzzyBalance = options.balance || true

  let chunks = []
  let _size = size

  while (items.length) {
    const initialRowIndex = items.length / size
    const isFinalRowOrTwo = initialRowIndex <= 2

    if (fuzzyBalance && isFinalRowOrTwo) {
      _size = size
      // if the remaining two rows would balance evenly each with `size-1`
      if (items.length / 2 === size - 1) _size = size - 1
      // if there are `size*2 - 1` items left, remove one from this row so the last
      // row has the requested amount of items
      if (items.length === size * 2 - 1) _size = size - 1
      // if we have `size` + 1 items left, increase size by 1 to fit them all in one row
      if (items.length <= size + 1) _size = size + 1
    }

    chunks.push(items.splice(0, Math.max(2, _size)))
  }

  return chunks
}

export function cx(...classnames) {
  return classnames.filter((cx) => !!cx).join(' ')
}

// https://usehooks.com/useWindowSize/
export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Call handler right away so state gets updated with initial window size
    handleResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty array ensures that effect is only run on mount

  return windowSize
}

/* Segment the given phrase into a short, punchy, memorable "main title" with
 * optional prefix/suffix. Museum object titles can be pretty long. Inspired by
 * our design department requesting that the first few words of a long title
 * use bold/black typography, with the rest left normal/light for the best
 * visual appearance and readability. It's also useful when determining a slug
 * for the artwork
 */
export function segmentTitle(rawTitle, options = {}) {
  const { returnJSX = true } = options

  // first, segment on special characters
  let segmentedTitle = rawTitle
    .split(/([^\(\)\[\],:;|]+)/) // eslint-disable-line no-useless-escape
    .filter((s) => s !== '')

  // then based on quotes and a loose set of prepositions if the first attempt
  // left an over-long 'first segment'...
  if (segmentedTitle[0].length > 23) {
    segmentedTitle = segmentedTitle.map((s) =>
      s.split(/(^"[^"]+| with | in | at )/i).filter((s) => s !== '')
    )
    segmentedTitle = segmentedTitle.flat(1)
  }

  let prefix = ''
  let [mainTitle, ...suffix] = segmentedTitle
  // shift leading punctuation into `prefix`
  if (mainTitle.match(/^("|“)/))
    [prefix, mainTitle] = mainTitle.split(/^("|“|\()/).filter((s) => s !== '')
  if (mainTitle.match(/^(\(|\[)/)) {
    // shift everything one slot to the left if mainTitle === '('
    ;[prefix, mainTitle, ...suffix] = [mainTitle, ...suffix] // eslint-disable-line no-extra-semi
  }
  // ... and trailing whitespace into `suffix`
  if (mainTitle.match(/\s+$/)) {
    mainTitle = mainTitle.trim()
    suffix.unshift(' ')
  }

  const title = (
    <>
      {prefix && prefix}
      <strong className="font-black">{mainTitle}</strong>
      {suffix && suffix.join('')}
    </>
  )

  return returnJSX ? title : [prefix, mainTitle, suffix.join('')]
}

export function titleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
