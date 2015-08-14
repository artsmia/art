var React = require('react')
var Router = require('react-router')

var ImageQuilt = require('../image-quilt')
var ArtworkImage = require('../artwork-image')
var Markdown = require('../markdown')

var SearchResultsC = React.createClass({
  mixins: [Router.Navigation],

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
    this.transitionTo('artwork', {id: art._id})
  },
})

module.exports = SearchResultsC
