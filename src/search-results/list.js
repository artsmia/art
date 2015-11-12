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
        <ArtworkResult id={id} data={{artwork: hit._source}} />
      </div>
    })

    return (
      <div className='mdl-grid'>
        <div className='objects-wrap leftBar mdl-cell mdl-cell--5-col'>
          {results}
          {this.props.postSearch}
        </div>
        {focusedResult && <FocusedResult art={focusedResult} {...this.props}/>}
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
