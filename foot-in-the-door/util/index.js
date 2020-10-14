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
  const { size } = options
  // const searchEndpoint = (term) => `https://search.artsmia.org/${term}`
  const randomEndpoint = (term) =>
    `https://search.artsmia.org/random/art?q=${term}&size=${size || 30}&fitd=1`
  const res = await fetch(randomEndpoint(term))
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
