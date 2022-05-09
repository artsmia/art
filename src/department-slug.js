var toSlug = require('speakingurl')

// { full name: short name, …}
var representations = {
  "Department of the Arts of Global Africa": 'africa',
  "Department of Global Contemporary Art": 'contemporary',
  "Department of European Art": 'european',
  "Department of the Arts of the Americas": 'americas',
  "Department of Asian Art": 'asia',
  // OLD Departments -- commenting out in case of potential bugs
  // "Art of Africa and the Americas": 'africa',
  // "Contemporary Art": 'contemporary',
  // "Decorative Arts, Textiles and Sculpture": 'dats',
  // "Paintings": 'paintings',
  // "Photography and New Media": 'photography',
  // "Prints and Drawings": 'prints',
  // "Chinese, South and Southeast Asian Art": 'cssaa',
  // "Japanese and Korean Art": 'jka'
}

// Associate [full name, short name, slug]
var nameTriple = Object.keys(representations).map(key => [key, representations[key], toSlug(key)], [])

module.exports = deptSelector => nameTriple.find((triple) => {
  if(triple.indexOf(deptSelector) > -1) return triple
})
