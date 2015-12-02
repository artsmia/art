function imageUrlForId(id) {
  return `http://${id%7}.api.artsmia.org/${id}.jpg`
}

module.exports = imageUrlForId

