var React = require('react')
var Router = require('react-router')

var ImageQuilt = require('../image-quilt')
var ArtworkImage = require('../artwork-image')
var ArtworkPreview = require('../artwork-preview')
var Markdown = require('../markdown')
var Sticky = require('react-sticky')

var SearchResultsD = React.createClass({
  mixins: [Router.Navigation],

  render() {
    var {hits, focusedResult} = this.props

    return <div>
      <div style={{width: '45%', float: 'left'}}>
        <ImageQuilt artworks={hits}
          maxRows={1000}
          rowHeight={125}
          onClick={this.clickResult}
          disableHover={true} />
      </div>
      {focusedResult && <div style={{width: '54%', float: 'right'}}><Sticky stickyStyle={{right: 0, top: 0, position: 'fixed', width: '54%'}}>
        <ArtworkPreview art={focusedResult} />
      </Sticky></div>}

    </div>
  },

  clickResult(art) {
    this.props.focusHandler(art)
  },
})

module.exports = SearchResultsD
