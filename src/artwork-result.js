var React = require('react')
var Router = require('react-router')
var { Link } = Router

var ArtworkImage = require('./artwork-image')

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
    const highlights = this.props.highlights
    const showHighlights = highlights && Object.keys(highlights).filter((field) => {
      return !field.match(/title|artist|image|room|highlight/)
    }) || []

    return (
      <div className='artwork-result'>
        <ArtworkImage art={art} id={id} />
          <div className="artwork-summary">
            <h1><span dangerouslySetInnerHTML={{__html: highlights && (highlights.title || highlights['title.ngram']) || art.title}}></span></h1>
            <h2><span dangerouslySetInnerHTML={{__html: highlights && (highlights.artist || highlights['artist.ngram']) || art.artist}}></span></h2>
            <p>{art.room === 'Not on View' ? art.room : <strong>{art.room}</strong>}</p>
          </div>
        <div>
          {showHighlights.map((key) => {
            return <p key={`highlight${key}`} className={['highlight', key].join(' ')} dangerouslySetInnerHTML={{__html: highlights[key][0].replace('\n', '<br>')}}></p>
          })}
        </div>
      </div>
    )
  }
})

module.exports = ArtworkResult
