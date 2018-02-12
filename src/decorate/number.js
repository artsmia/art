/** @format
 *
 * Decorate a search for a sole number. This can be an audio stop number or an accession number?
 * Maybe eventually a year or time period?
 *
 * TODO implement accession number recognition and lifting
 */

var React = require('react')

const Image = require('../image')
var { getFacetAndValue } = require('../artwork/creator')

var NumberDecorator = React.createClass({
  render() {
    const term = this.props.term[0]
    const hits = this.props.hits
    const matchingAccessionNumber =
      term.match(/\d+.\d+/) &&
      hits.find(hit => hit._source.accession_number === term)

    return <span>number decorator goes here</span>
  },
})

const AccessionLifter = React.createClass({
  render() {
    const { hit } = this.props
    const art = hit._source

    return (
      <div>
        <p>Searching for an accession number?</p>
      </div>
    )
  },
})

module.exports = NumberDecorator
