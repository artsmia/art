function imageUrlForId(id, size=400) {
  size = size == 'full' ? 'full/' : ((size > 400) ? '800/' : '')
  return `https://${id%7}.api.artsmia.org/${size}${id}.jpg`
}

module.exports = imageUrlForId

