/** @format */
import { useState, useEffect } from 'react'

export function getImageSrc(artworkData, thumbnail = true) {
  const id = artworkData.id
  const imageFilename = artworkData.image
  const thumb = 'tn_' + imageFilename.replace(/jpeg|png|JPG/i, 'jpg')
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
  } = options
  const queryParams = `size=${size || 30}&fitd=1`
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

export async function likeArtwork(id) {
  const isDev = false // TODO env var? Next magic var?
  const searchEndpoint = isDev
    ? `http://localhost:4680`
    : `https://search.artsmia.org`
  const surveyEndpoint = `${searchEndpoint}/survey/art/fitd|${id}/like?subset=fitd`
  const res = await fetch(surveyEndpoint, {
    credentials: 'include',
  })
  const text = await res.text()

  return text
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
