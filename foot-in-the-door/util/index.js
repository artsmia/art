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

export async function getSearchResults(term) {
  // const searchEndpoint = (term) => `https://search.artsmia.org/${term}`
  const randomEndpoint = (term) =>
    `https://search.artsmia.org/random/art?q=${term}&size=30&fitd=1`
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
