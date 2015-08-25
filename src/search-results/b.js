var React = require('react')

var Sticky = require('react-sticky')
var ArtworkPreview = require('../artwork-preview')

var SearchResultsB = React.createClass({
  render() {
    var {results, focusedResult} = this.props

    return (
      <div className='search-results-wrap clearfix'>
        <div className='objects-wrap' style={{clear: 'both'}}>{results}</div>
        <Sticky stickyClass="objects-focus-sticky" stickyStyle={{}}>
          {focusedResult && <ArtworkPreview art={focusedResult} 
            style={{width: '66%'}} />}
            <button style={{position: 'absolute', right: '1em'}} onClick={this.closeFocusBox}>(x)</button>
        </Sticky>
      </div>
    )
  },

  closeFocusBox() {
    this.props.changeView()
  },
})

module.exports = SearchResultsB
