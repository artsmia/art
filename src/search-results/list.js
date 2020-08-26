var React = require('react')

var ArtworkResult = require('../artwork-result')
var FocusedResult = require('./focused')

var SearchResultsList = React.createClass({
  render() {
    var {
      leftColumnWidth,
      focusedResult,
      focusHandler,
      smallViewport,
      customImage,
      ...focusedProps
    } = this.props

    if(smallViewport || this.context.universal) {
      focusedResult = null
    }
    if(!focusedResult) leftColumnWidth = '100%'

    var results = this.props.hits.map((hit) => {
      var id = hit._source.id.replace('http://api.artsmia.org/objects/', '')
      var focused = focusedResult === hit._source
      return <div key={id} onClick={this.handleClick.bind(this, hit)} className={focused ? 'focused' : ''}>
        <ArtworkResult id={id} data={{artwork: hit._source}} highlights={hit.highlight} showMore={smallViewport} customImage={customImage} />
      </div>
    })

    return (
      <div className='search-results-wrap clearfix' style={{position: 'relative', minHeight: this.props.minHeight}}>
        <div className='objects-wrap leftBar' style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: leftColumnWidth}}>
          {results}
          {this.props.postSearch}
        </div>
        {focusedResult && <FocusedResult key={focusedResult._source.id} art={focusedResult._source} highlights={focusedResult.highlight} {...this.props}/>}
      </div>
    )
  },

  handleClick(hit) {
    this.props.focusHandler(hit, SearchResultsList)
  },
})
SearchResultsList.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
}

module.exports = SearchResultsList
