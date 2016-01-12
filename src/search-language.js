var searchLanguageMap = (queryText) => {
  var map = {
    'recent:true': "Recent Accessions",
    'highlight:true': "Museum Highlights",
    'deaccessioned:"true"': "Deaccessioned",
    '_exists_:"provenance"': "provenance information exists",
    '_exists_:"related:conservation"': 'Conserved artworks',
    '_exists_:"related:artstories"': "ArtStories",
    '_exists_:"related:newsflashes"': "NewsFlashes",
    '_exists_:"related:audio-stops"': "Audio stops",
    '_exists_:"related:stories"': "Mia Stories",
    '_exists_:"related:adopt-a-painting"': "Adopt-a-Painting",
    'room:G*': 'On View',
    'room:"Not on View"': 'Not on View',
    'image:valid': "Image Available",
    'image:invalid': "Image Unavailable",
    'room:"G320"': "TODO: need to match parameters more cleverly? This should return 'In Gallery 320' or something",
  }


  var reversedMap = Object.keys(map)
    .reduce((reversed, key) => { reversed[map[key]] = key; return reversed }, {})

  var trimmedQuery = queryText && queryText.trim()

  return map[trimmedQuery] || reversedMap[trimmedQuery] || queryText
}

module.exports = searchLanguageMap
