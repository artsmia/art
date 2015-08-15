var React = require('react')

var ImageQuilt = require('../image-quilt')
var ArtworkImage = require('../artwork-image')
var Markdown = require('../markdown')
var SearchResultsD = require('./d')

var SearchResultsC = React.createClass({
  render() {
    var hits = this.props.hits
    return <div>
      <ImageQuilt artworks={hits}
        maxRows={1000}
        rowHeight={125}
        onClick={this.clickResult}
        disableHover={true} />
    </div>
  },

  clickResult(art) {
    this.props.focusHandler(art)
    this.props.changeView(SearchResultsD)
  },
})

module.exports = SearchResultsC
