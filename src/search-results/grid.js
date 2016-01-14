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

    return <div className="dogs!" style={{position: 'relative', minHeight: this.props.minHeight}}>
      {wrappedQuilt}
      {focusedResult && <FocusedResult key={focusedResult.id} art={focusedResult} {...this.props}/>}
    </div>
  },

  clickResult(art) {
    art && this.props.focusHandler(art, SearchResultsGrid)
  },

  shouldComponentUpdate(nextProps, nextState) {
    // don't update if only the minHeight prop changed.
    // Because when it re-renders, it closes open peeks? I haven't figured out why but this fixes is. Tread carefully.
    return this.props.minHeight == nextProps.minHeight
  },
})

module.exports = SearchResultsGrid
