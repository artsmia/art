var React = require('react')
var Router = require('react-router')

var ImageQuilt = require('../image-quilt')
var ArtworkImage = require('../artwork-image')
var FocusedResult = require('./focused.js')
var SearchSummary = require('../search-summary')

var SearchResultsGrid = React.createClass({
  mixins: [Router.Navigation],

  render() {
    var {hits, leftColumnWidth, focusedResult, smallViewport, focusHandler, ...focusedProps} = this.props
    var targetHeight = hits.length < 20 ? 250 : 150
    var quilt = <ImageQuilt artworks={hits}
      maxRows={1000}
      rowHeight={targetHeight}
      maxRowHeight={500}
      onClick={this.clickResult}
      disableHover={true} />

    var more = this.props.postSearch

    var stuff = <div>
      {quilt}
      {more}
    </div>

    if(smallViewport || this.context.universal) {
      focusedResult = null
    }

    if(!focusedResult) leftColumnWidth = '100%'

    var wrappedQuilt = !focusedResult ?
      stuff :
      <div className="leftBar" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: leftColumnWidth}}>
        {stuff}
      </div>

    return <div style={{position: 'relative'}}>
      {wrappedQuilt}
      {focusedResult && <FocusedResult key={focusedResult.id} art={focusedResult} {...this.props}/>}
    </div>
  },

  clickResult(art) {
    art && this.props.focusHandler(art, SearchResultsGrid)
  },
})

module.exports = SearchResultsGrid
