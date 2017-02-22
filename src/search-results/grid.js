var React = require('react')
var Router = require('react-router')
var splitArray = require('split-array')

var ImageQuilt = require('../image-quilt')
var ArtworkImage = require('../artwork-image')
var FocusedResult = require('./focused.js')
var SearchSummary = require('../search-summary')

var SearchResultsGrid = React.createClass({
  mixins: [Router.Navigation],

  componentWillMount() {
    this.cachedQuilts = []
  },

  componentWillReceiveProps(nextProps) {
    var searchChanged = this.props.search.query != nextProps.search.query
      || this.props.search.filters != nextProps.search.filters
      || this.props.hits.slice(0, 10) !== nextProps.hits.slice(0, 10)

    if(searchChanged) {
      this.cachedQuilts = []
    }
  },

  render() {
    var {hits, leftColumnWidth, focusedResult, smallViewport, focusHandler, ...focusedProps} = this.props
    var targetHeight = hits.length < 20 ? 250 : 150
    var quilts = splitArray(hits, 50).map((chunkedHits, index) => {
      var chunkedQuilt = this.cachedQuilts[index] || <ImageQuilt
        artworks={chunkedHits}
        maxRows={1000}
        rowHeight={targetHeight}
        maxRowHeight={500}
        onClick={this.clickResult}
        key={index}
        disableHover={true} />

      if(chunkedHits.length >= 50) this.cachedQuilts[index] = chunkedQuilt
      return chunkedQuilt
    })

    var dividedQuilts = quilts.map((quilt, index) => {
      var start = index*50
      var end = (index+1)*50
      var _key = `range:${start}-${end}`
      return <div id={_key} key={_key}>
        {quilt}
      </div>
    })
    var more = this.props.postSearch

    var stuff = <div>
      {dividedQuilts}
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

    return <div style={{position: 'relative', minHeight: this.props.minHeight}}>
      {wrappedQuilt}
      {focusedResult && <FocusedResult key={focusedResult._source.id} art={focusedResult._source} highlights={focusedResult.highlight} {...this.props}/>}
    </div>
  },

  clickResult(art) {
    art && this.props.focusHandler(art, SearchResultsGrid)
  },
})

module.exports = SearchResultsGrid
