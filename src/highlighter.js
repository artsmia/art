function highlightField(source, highlights, field) {
  if(!highlights) return source[field]

  var possibleHighlights = Object.keys(highlights)
  .filter(key => key.match(new RegExp("^"+field)))
  .map(key => highlights[key][0])

  return highlights && possibleHighlights && possibleHighlights[0]
    || source[field]
}

module.exports = highlightField
