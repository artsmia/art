/** @format
 */

var React = require('react')

// CC PDM or CC0 isn't a rightsstatement. Here we sling it in with the rightsstatements, how does that work?
const publicDomainMark = {
  id: 'https://creativecommons.org/publicdomain/mark/1.0/',
  identifier: 'CC-PDM',
  label: 'Public Domain',
  definition: 'This work has been identified as being free of known restrictions under copyright law, including all related and neighboring rights.\n\nYou can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission. See Other Information below.',
}

// TODO: It appears that this module is installed locally. For now I'm just going to comment this out and replace it
// with an empty array so I can get to the accessibility fixes.
// const importedRightsStatements = require('rightsstatements');

const importedRightsStatements = [];

const rightsstatements = [
  ...importedRightsStatements.map(rs => {
    rs.definition = rs.definition
      .replace('The copyright and related rights status of this Item has not been evaluated', 'The copyright and related rights status of this Item has not been evaluated by the Minneapolis Institute of Art (Mia)')
      .replace('Please refer to the organization that has made the Item available for more information.', 'Please contact us for more information.')
      .replace(/The organization that has made the Item available/i, 'Minneapolis Institute of Art (Mia)') // TODO link 'contact us' to collectionsdata@artsmia.org
      .replace('the organization was', 'we were')

    if (rs.definition.match(/The organization/)) {
      console.info(rs.label, rs.definition, rs.identifier)
      // debugger
    }
    return rs
  }),
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
  if (!rightsStmt && legacyName !== 'getRights') {
    console.info({ legacyName, legacyToStand, rightsStmt })
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
const getRights = function (art) {
  art.rights_type = art.rights_type || art.rights
  art.rights = false
  return art.rights_type
};

// Due to limitations in our TMS database, we don't exactly map rights statements correctly.
// This is a map that corrects our shortened statements (…due to a character limit on the field in SQL…)
// to the full Rights Statement label
const miaRightsLabelToRightsStatementID = {
  "In Copyright–Educational Use": "InC-EDU",
  "In Copyright–Non-Commercial Use": "InC-NC",
  "In Copyright–Rights-holder(s) Unlocatable": "InC-RUU",
  "No Copyright–United States": "NoC-US",
  "No Copyright—Contractual Restrictions": "NoC-CR",
}

// TODO map Mia used named to proper rights statements labels
// this would have been 10x easier if we'd just used the short hand identifier,
// but probably wouldn't read well in TMS

function RightsStatementIcon({ statement, color, style, ...props }) {
  if (!statement) return <span />

  var shortId = statement.identifier.split('-')[0]
  var iconURL = statement.identifier === 'CC-PDM' ?
    `https://upload.wikimedia.org/wikipedia/commons/a/af/Cc-public_domain_mark.svg`
    : `https://rightsstatements.org/files/icons/${shortId}.Icon-Only.${color || 'white'}.svg`
  var fullIconURL = statement.identifier === 'CC-PDM' ?
    `https://upload.wikimedia.org/wikipedia/commons/a/af/Cc-public_domain_mark.svg`
    : `https://rightsstatements.org/files/buttons/${statement.identifier}.${color || 'white'}.svg`

  return <img
    src={fullIconURL}
    style={{ paddingRight: '0.43em', display: 'inline', height: '1em', ...style }}
    alt={`${statement.label} Rights Statement icon`}
    alt=""
    {...props}
  />
}


module.exports = {
  legacy: {
    ...miaLegacyRightsTypes,
    getRights,
  },
  rightsStatements: {
    ...rightsstatements,
    getRights,
  },
  findByName: name => {
    const mappedRightsID = miaRightsLabelToRightsStatementID[name]
    const rights = rightsstatements.find(st => st.label === name || st.legacyName === name || st.identifier === mappedRightsID)

    return rights
  },
  getRights,
  RightsStatementIcon,
}
