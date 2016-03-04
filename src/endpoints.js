module.exports = {
  search: "http://search.artsmia.org",
  info: "http://cdn.dx.artsmia.org/collection-info/index.json",
  dimensionSvg: (id, file) => `http://collections.artsmia.org/dimensions/${id}/${file || 'dimensions'}.svg`,
  relatedInfo: (id) => `http://collections.artsmia.org/links/${id}.json`,
  galleryPanel: (room) => `https://cdn.rawgit.com/artsmia/mia-gallery-panels/master/${room}.md`,
}
