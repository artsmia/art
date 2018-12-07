var React = require('react')

var {
  findByName,
  legacy: rightsDescriptions,
  rightsStatements,
  RightsStatementIcon,
} = require('../rights-types.js')

var RightsDecorator = React.createClass({
  render() {
    var rightsType = this.props.term[0].match(/rights_type:"?([^"]*)"?/)[1]
    var rightsStatement = findByName(rightsType)
    if(!rightsStatement) return <span />

    return <div className="decorator">
      <p>
        <a href={rightsStatement.id}>
          <RightsStatementIcon statement={rightsStatement} />
          {rightsStatement.label}
        </a>
      </p>
      {rightsStatement.definition.replace('This Item is', 'These Items are').replace('this Item', 'these Items')}
    </div>
  },
})

module.exports = RightsDecorator
