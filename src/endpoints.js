module.exports = {
  search: "http://collections.artsmia.org:4680",
  info: "http://artsmia.github.io/collection-info/index.json",
  dimensionSvg: (id, file) => `http://collections.artsmia.org/dimensions/${id}/${file || 'dimensions'}.svg`,
}
