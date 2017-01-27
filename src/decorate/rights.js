var React = require('react')

var rightsDescriptions = require('../rights-types.js')

var RightsDecorator = React.createClass({
  render() {
    var rightsType = this.props.term[0].match(/rights:"?([^"]*)"?/)[1]
    var rightsDesc = rightsDescriptions[rightsType]
    if(!rightsDesc) return <span />

    return <div className="decorator">
      <h3>{rightsType}</h3>
      <p>{rightsDesc} <a href="https://new.artsmia.org/visit/policies-guidelines/#websiteimageaccess&use">Mia's Image Access & Use Policy</a></p>
    </div>
  },
})

module.exports = RightsDecorator
