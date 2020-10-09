/** @format */

export function getImageSrc(artworkData, thumbnail = true) {
  const id = artworkData.id
  const imageFilename = artworkData.image
  const thumb = 'tn_' + imageFilename.replace(/jpeg|png/i, 'jpg')
  const bucket = Math.ceil(Math.max(id - 1, 1) / 135)

  return `/foot-in-the-door/images/fitd/${bucket}/${
    thumbnail ? thumb : imageFilename
  }`
}

export async function getSearchResults(term) {
  // const searchEndpoint = (term) => `http://localhost:4680/${term}`
  const randomEndpoint = (term) =>
    `http://localhost:4680/random/art?q=${term}&size=30`
  const res = await fetch(randomEndpoint(term))
  const results = await res.json()

  return results
}

export async function fetchById(id) {
  const res = await fetch(`http://localhost:4680/id/${id}`)
  const artwork = await res.json()

  return artwork
}
