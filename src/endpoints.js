module.exports = {
  search: "http://search.artsmia.org",
  info: "http://collections.artsmia.org/_info/index.json",
  dimensionSvg: (id, file) => `http://mia-dimensions.s3.amazonaws.com/${id}/${file || 'dimensions'}.svg`,
  galleryPanel: (room) => `https://cdn.rawgit.com/artsmia/mia-gallery-panels/master/${room}.md`,
}
