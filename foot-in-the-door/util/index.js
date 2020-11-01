/** @format */
import { useState, useEffect } from 'react'

export function getImageSrc(artworkData, thumbnail = true) {
  const id = artworkData.id
  const imageFilename = artworkData.image
  const thumb =
    'tn_' +
    imageFilename.replace(/jpeg|png|JPG|tiff?$/i, 'jpg').replace('+', '%2B')
  const bucket = Math.ceil(Math.max(id - 1, 1) / 135)
  const image = `${bucket}/${imageFilename}`

  return `https://foot-in-the-door-2020.s3.amazonaws.com/800/${
    thumbnail ? thumb : image
  }`
}

export function getImageProps(artData) {
  return {
    src: getImageSrc(artData),
    alt: artData.description,
    width: artData.image_width,
    height: artData.image_height,
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
  } = options

  const from = _from || 0
  const queryParams = `size=${size || 30}&from=${from}&fitd=1`
  const searchEndpoint = (term) =>
    `https://search.artsmia.org/${term}?${queryParams}`
  const randomEndpoint = (term) =>
    `https://search.artsmia.org/random/art?q=${term}&${queryParams}`
  const res = await fetch(
    useNormalSearch ? searchEndpoint(term) : randomEndpoint(term)
  )
  const results = await res.json()

  return results
}

export async function fetchById(id) {
  const res = await fetch(`https://search.artsmia.org/id/${id}?fitd=1`)
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

export async function getUserLikes() {
  const surveyEndpoint = `${searchEndpoint}/survey/favorites`
  const res = await fetch(surveyEndpoint, {
    credentials: 'include',
  })
  const { userId, likes } = await res.json()

  const localData = JSON.parse(localStorage?.getItem('artsmia-fitd') || '{}')

  const ids = [
    ...new Set([
      ...likes.map((id) => Number(id.replace('fitd|', ''))),
      ...(localData.likes || []),
    ]),
  ]
    .filter((item) => item)

    .join(',')

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
export async function getImages(size) {
  const results = await Promise.all(
    classifications.map(async function (c) {
      const json = await getSearchResults(`classification:${c}`, {
        size: size || 1,
      })
      return json
    })
  )

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
