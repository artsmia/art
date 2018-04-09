var React = require('react')

var {
  findByName,
  legacy: rightsDescriptions,
  rightsStatements
} = require('../rights-types.js')

var RightsDecorator = React.createClass({
  render() {
    var rightsType = this.props.term[0].match(/rights:"?([^"]*)"?/)[1]
    var rightsDesc = rightsDescriptions[rightsType]
    if(!rightsDesc) return <span />

    const rightsStatement = findByName(rightsType)
    console.info('rights decorator', {rightsType, rightsStatement})

    return <div className="decorator">
      <h3>{rightsType}</h3>
      <p>{rightsDesc} <a href="https://new.artsmia.org/visit/policies-guidelines/#websiteimageaccess&use">Mia's Image Access & Use Policy</a></p>
      <details><summary>Forthcoming RightsStatement: {rightsStatement.label}</summary>
      {rightsStatement.definition}
      </details>
    </div>
  },
})

module.exports = RightsDecorator
