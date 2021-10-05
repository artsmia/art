var toSlug = require('speakingurl')

// { full name: short name, …}
var representations = {
  "Department of the Arts of Global Africa": 'africa',
  "Department of Global Contemporary Art": 'contemporary',
  "Department of European Art": 'european',
  "Department of the Arts of the Americas": 'americas',
  "Department of Asian Art": 'asia',
}

// Associate [full name, short name, slug]
var nameTriple = Object.keys(representations).map(key => [key, representations[key], toSlug(key)], [])

module.exports = deptSelector => nameTriple.find((triple) => {
  if(triple.indexOf(deptSelector) > -1) return triple
})
