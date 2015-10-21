var React = require('react')

var ArtworkPreview = require('../artwork-preview')
var Markdown = require('../markdown')
var Sticky = require('../bottom-sticky')

var FocusedResult = React.createClass({
  render() {
    var leftSpacing = this.props.leftColumnWidth.replace(/(\d+)/, int => parseInt(int)+3)

    return <div className="focusedResult" style={{position: 'absolute', top: 0, left: leftSpacing, right: 0, bottom: 0, width: '60%'}}>
      <Sticky stickyStyle={{right: 0, top: 0, position: 'fixed', left: leftSpacing, width: '60%'}}>
        <ArtworkPreview art={this.props.art} />
        <span style={{position: 'absolute', right: '1em', marginTop: '1em', cursor: 'pointer'}} onClick={this.close}>
          <i className="material-icons">clear</i>
        </span>
      </Sticky>
    </div>
  },

  close() {
    this.props.focusHandler()
  },
})

module.exports = FocusedResult
