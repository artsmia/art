var React = require('react')

var ArtworkPreview = require('../artwork-preview')
var Markdown = require('../markdown')
var Sticky = require('../bottom-sticky')

var FocusedResult = React.createClass({
  render() {
    var leftSpacing = this.props.leftColumnWidth.replace(/(\d+)/, int => parseInt(int)+3)

    return <div className="focusedResult mdl-cell mdl-cell--7-col">
        <ArtworkPreview art={this.props.art} />
        <span style={{position: 'absolute', right: '1em', marginTop: '1em', cursor: 'pointer'}} onClick={this.close}>
          <i className="material-icons">clear</i>
        </span>
    </div>
  },

  close() {
    this.props.focusHandler()
  },
})

module.exports = FocusedResult
