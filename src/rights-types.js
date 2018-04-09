/** @format
 */

// CC PDM or CC0 isn't a rightsstatement. Here we sling it in with the rightsstatements, how does that work?
const publicDomainMark = {
  id: 'https://creativecommons.org/publicdomain/mark/1.0/',
  identifier: 'CC-PDM',
  label: 'Public Domain',
  definition: 'This work has been identified as being free of known restrictions under copyright law, including all related and neighboring rights.\n\nYou can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission. See Other Information below.',
}

const rightsstatements = [
  ...require('rightsstatements'),
  publicDomainMark,
]

const miaLegacyRightsTypes = {
  "Copyright Protected": "Artwork is copyright protected. Permission from the rights holder named here may be required for use. A copyright statement and credit line must accompany image.",
  "Full Permission": "Artwork is copyright protected. Mia holds a non-exclusive license to reproduce images from the rights holder named here. A copyright statement and credit line must accompany image.",
  "Need Permission": "Copyright protection is assumed for this artwork. Object rights status has not yet been determined or assigned.",
  "No Known Copyright Restrictions": "Artwork may be protected by some other intellectual property, or may be considered ineligible for copyright protection (ex. useful articles). Alternately, artwork may be in the public domain in the United States, but the public domain status has not or cannot be clearly determined.",
  "Non-commercial Use": "Artwork is copyright protected. Mia holds a non-exclusive license to reproduce images of this artwork, for limited non-commercial uses only, from the rights holder named here. A copyright statement and credit line must accompany image.",
  "Orphaned Work": "Artwork may be subject to copyright protection under the terms of current US copyright law. Mia has been unable to identify the creator and/or rights holder. The statement “Copyright of the artist, artist’s estate, or assignees” should accompany image.",
  "Public Domain": "Artwork is in the public domain. Images are available for any use.",
  "Permission Denied": "Artwork is copyright protected. Mia has contacted the rights holder and the rights holder denied Mia any use rights.",
  getRights,
}

const legacyToStandardizedStmt = {
  "Copyright Protected": "In Copyright",
  "Non-Commercial Use": "In Copyright - Educational Use Permitted",
  "Non-commercial Use": "In Copyright - Educational Use Permitted",
  "Full Permission": "In Copyright - Non-Commercial Use Permitted",
  "Orphaned Work": "In Copyright - Rights-holder(s) Unlocatable or Unidentifiable",
  "Permission Denied": "In Copyright", // TODO what goes here? Empty in Heidi's mapping
  "Public Domain": "Public Domain", 
  "No Known Copyright Restrictions": "No Known Copyright",
  "Need Permission": "Copyright Not Evaluated",
}

const _rightsStatements = Object.keys(miaLegacyRightsTypes).map(legacyName => {
  const legacyExplanation = miaLegacyRightsTypes[legacyName]

  const legacyToStand = legacyToStandardizedStmt[legacyName]
  const rightsStmt = rightsstatements.find(stmt => stmt.label === legacyToStand)
  if(!rightsStmt && legacyName !== 'getRights') {
    console.info({legacyName, legacyToStand, rightsStmt})
    debugger
  }

  return {
    ...rightsStmt,
    legacyName,
    legacyExplanation,
  }
})


// This is a kludge because this used to use the field `rights` but now
// needs to use `rights_type`. Some artworks only have `rights`, some have both.
//
// TODO reindex all of ES to remove `rights` and  populate `rights_type`
const getRights = function(art) {
  art.rights_type = art.rights_type || art.rights
  art.rights = false
  return art.rights_type
}

module.exports = {
  legacy: {
    ...miaLegacyRightsTypes,
    getRights,
  },
  rightsStatements: {
    ..._rightsStatements,
    getRights,
  },
  findByName: name => _rightsStatements.find(st => st.label === name || st.legacyName === name),
  getRights,
}
