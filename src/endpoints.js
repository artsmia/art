var protocol = (typeof(window) == "undefined" ? "http" : "https")+"://"
module.exports = {
  search: protocol+"search.artsmia.org",
  info: protocol+"collections.artsmia.org/_info/index.json",
  dimensionSvg: (id, file) => `https://mia-dimensions.s3.amazonaws.com/${id}/${file || 'dimensions'}.svg`,
  galleryPanel: (room) => `https://cdn.rawgit.com/artsmia/mia-gallery-panels/master/${room}.md`,
  exhibition: (id) => protocol+`cdn.dx.artsmia.org/exhibitions/${Math.floor(id/1000)}/${id}.json`,
}
