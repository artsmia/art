var React = require('react')
var Router = require('react-router')
var { Link } = Router

var Artwork = require('./_artwork')
var Markdown = require('./markdown')
var highlighter = require('./highlighter')

var ArtworkResult = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: (params) => {
      return rest(`${SEARCH}/id/`+params.id).then((r) => JSON.parse(r.entity))
    }
  },
  render() {
    var art = this.props.data.artwork
    var id = this.props.id || art.id.replace('http://api.artsmia.org/objects/', '')
    var title = <Artwork.Title art={art} link={this.context.universal} highlights={this.props.highlights} />

    var roomHighlight = highlighter(art, this.props.highlights, 'room')

    return (
      <Artwork.Figure art={art} className='artwork-result'>
        <div className="artwork-summary">
          {title}
          <Artwork.Creator art={art} wrapper="h2" peek={false} highlights={this.props.highlights} />
          <p>{art.room === 'Not on View' ? art.room : <strong><Markdown>{roomHighlight}</Markdown></strong>}</p>
        </div>
      </Artwork.Figure>
    )
  }
})
ArtworkResult.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
}

module.exports = ArtworkResult
