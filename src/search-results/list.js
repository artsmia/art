var React = require('react')

var ArtworkResult = require('../artwork-result')
var FocusedResult = require('./focused')

var SearchResultsList = React.createClass({
  render() {
    var {leftColumnWidth, focusedResult, focusHandler, ...focusedProps} = this.props

    var results = this.props.hits.map((hit) => {
      var id = hit._source.id.replace('http://api.artsmia.org/objects/', '')
      var focused = focusedResult === hit._source
      return <div key={id} onClick={focusHandler.bind(this, hit, SearchResultsList)} className={focused ? 'focused' : ''}>
        <ArtworkResult id={id} data={{artwork: hit._source}} />
      </div>
    })

    return (
      <div className='search-results-wrap clearfix' style={{position: 'relative'}}>
        <div className='objects-wrap' style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: leftColumnWidth}}>
          {results}
        </div>
        {focusedResult && <FocusedResult art={focusedResult} {...this.props}/>}
      </div>
    )
  },
})

module.exports = SearchResultsList
