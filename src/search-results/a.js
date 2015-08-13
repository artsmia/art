var React = require('react')

var ArtworkImage = require('../artwork-image')
var Markdown = require('../markdown')

var SearchResultsA = React.createClass({
  render() {
    var {results, focusedResult} = this.props

    return <div>{results}</div>
  },
})

module.exports = SearchResultsA

