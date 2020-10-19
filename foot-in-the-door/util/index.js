/** @format */

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

export function chunkArray(items, size = 3) {
  const increaseSizeForFinalChunks = true
  let chunks = [items.splice(0, size)]
  let _size = size

  while (items.length) {
    const isPenultimateRow = items.length <= size * 2 && items.length > size
    const isUltimateRow = items.length <= size
    const isFinalRowOrTwo = isPenultimateRow || isUltimateRow

    if (increaseSizeForFinalChunks && isFinalRowOrTwo) {
      // const delta = items.length % size
      _size = items.length % size === 0 ? size : size + 1

      // if the last row will have > 3 items, don't adjust this row
      if (isPenultimateRow && items.length - size > 3) _size = size

      // don't leave a single item in the last row, go back to the default
      // size.
      const adjustedSizeLeavesOrphanRow = items.length % _size === 1
      if (isFinalRowOrTwo && adjustedSizeLeavesOrphanRow) _size = size - 1
    }

    chunks.push(items.splice(0, Math.max(2, _size)))
  }

  return chunks
}
