module.exports = {
  search: "http://search.artsmia.org",
  info: "http://artsmia.github.io/collection-info/index.json",
  dimensionSvg: (id, file) => `http://collections.artsmia.org/dimensions/${id}/${file || 'dimensions'}.svg`,
  exhibition: (id) => `http://cdn.dx.artsmia.org/exhibitions/${Math.floor(id/1000)}/${id}.json`,
}
