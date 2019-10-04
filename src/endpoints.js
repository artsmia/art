var protocol = (typeof(window) == "undefined" ? "http" : "https")+"://"
module.exports = {
  search: protocol+"search.artsmia.org",
  // search: 'http://localhost:4680',
  info: "https://artsmia.github.io/collection-info/index.json",
  dimensionSvg: (id, file) => `https://mia-dimensions.s3.amazonaws.com/${id}/${file || 'dimensions'}.svg`,
  galleryPanel: (room) => `"https://cdn.jsdelivr.net/gh/artsmia/mia-gallery-panels@master/${room}.md`,
  exhibition: (id) => protocol+`cdn.dx.artsmia.org/exhibitions/${Math.floor(id/1000)}/${id}.json`,
}
