function imageUrlForId(id, size=400) {
  var size = (size > 400) ? '800/' : ''
  return `http://${id%7}.api.artsmia.org/${size}${id}.jpg`
}

module.exports = imageUrlForId

