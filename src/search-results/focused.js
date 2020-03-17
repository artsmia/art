var React = require('react')

var ArtworkPreview = require('../artwork-preview')
var Markdown = require('../markdown')
var Sticky = require('../bottom-sticky')
var ArtworkRelated = require('../artwork-related')

var FocusedResult = React.createClass({
  render() {
    var leftSpacing = this.props.leftColumnWidth.replace(/(\d+)/, int => parseInt(int)+3)
    var {art, highlights} = this.props
    var hasRelatedHighlight = highlights && Object.keys(highlights).join(' ').match(/related:/)

    return <Sticky
      className="focusedResult"
      baseStyle={{position: 'relative', top: 0, left: leftSpacing, right: 0, width: '60%'}}
      stickyStyle={{position: 'fixed'}}
    >
      <ArtworkPreview art={art} highlights={highlights} onlyShowHighlightDetails={true} key={art.id} />
      <span className="closePreview" style={{position: 'absolute', right: '1em', marginTop: '1em', cursor: 'pointer'}} onClick={this.close}>
        <i className="material-icons">clear</i>
      </span>
      <ArtworkRelated id={art.id} art={art} skipWrapper={true} highlights={highlights} />
    </Sticky>
  },

  close() {
    this.props.focusHandler()
  },
})

module.exports = FocusedResult
