var React = require('react')

var Sticky = require('../bottom-sticky')
var ArtworkPreview = require('../artwork-preview')

var SearchResultsB = React.createClass({
  render() {
    var {results, focusedResult} = this.props

    return (
      <div className='search-results-wrap clearfix'>
        <div className='objects-wrap' style={{clear: 'both'}}>{results}</div>
        {focusedResult && <div style={{width: '65%', float: 'right'}}>
          <Sticky stickyStyle={{right: 0, top: 0, position: 'fixed', width: '65%'}}>
            <ArtworkPreview art={focusedResult} />
            <span style={{position: 'absolute', right: '1em', marginTop: '1em', cursor: 'pointer'}} onClick={this.closeFocusBox}><i className="material-icons">clear</i></span>
          </Sticky>
        </div>}
      </div>
    )
  },

  closeFocusBox() {
    this.props.changeView()
  },
})

module.exports = SearchResultsB
