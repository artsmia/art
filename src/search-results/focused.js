var React = require('react')

var ArtworkPreview = require('../artwork-preview')
var Markdown = require('../markdown')
var Sticky = require('../bottom-sticky')
var ArtworkRelated = require('../artwork-related')

var FocusedResult = React.createClass({
  render() {
    var leftSpacing = this.props.leftColumnWidth.replace(/(\d+)/, int => parseInt(int)+3)
    var {art, highlights} = this.props
    var {relatedLinks} = this.state
    var hasRelatedHighlight = highlights && Object.keys(highlights).join(' ').match(/related:/)
    var showRelated = this.props.showRelated || hasRelatedHighlight

    return <div className="focusedResult" style={{position: 'absolute', top: 0, left: leftSpacing, right: 0, bottom: 0, width: '60%'}}>
      <Sticky stickyStyle={{right: 0, top: 0, position: 'fixed', left: leftSpacing, width: '60%'}} relatedLinks={relatedLinks}>
        <ArtworkPreview art={art} highlights={highlights} />
        <span style={{position: 'absolute', right: '1em', marginTop: '1em', cursor: 'pointer'}} onClick={this.close}>
          <i className="material-icons">clear</i>
        </span>
        {showRelated && relatedLinks &&
          <ArtworkRelated id={art.id} links={relatedLinks} skipWrapper={true} highlights={highlights} />
        }
      </Sticky>
    </div>
  },

  close() {
    this.props.focusHandler()
  },

  componentDidMount() {
    ArtworkRelated.fetchData(this.props.art).then(json => {
      this.setState({relatedLinks: json})
    })
  },

  getInitialState() {
    return {
      relatedLinks: null,
    }
  },
})

module.exports = FocusedResult
