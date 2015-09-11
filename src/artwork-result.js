var React = require('react')
var Router = require('react-router')
var { Link } = Router

var Artwork = require('./_artwork')

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
    var title = <Artwork.Title art={art} link={this.context.universal} />

    const highlights = this.props.highlights
    const showHighlights = highlights && Object.keys(highlights).filter((field) => {
      return !field.match(/title|artist|image|room|highlight/)
    }) || []

    return (
      <Artwork.Figure art={art} className='artwork-result'>
        <div className="artwork-summary">
          {title}
          <Artwork.Creator art={art} wrapper="h2" peek={false} />
          <p>{art.room === 'Not on View' ? art.room : <strong>{art.room}</strong>}</p>
        </div>
        <div>
          {showHighlights.map((key) => {
            return <p key={`highlight${key}`} className={['highlight', key].join(' ')} dangerouslySetInnerHTML={{__html: highlights[key][0].replace('\n', '<br>')}}></p>
          })}
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
