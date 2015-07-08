var React = require('react')
var Router = require('react-router')
var { Link } = Router
var ClickToSelect = require('react-click-to-select')

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
        <h1><span dangerouslySetInnerHTML={{__html: highlights && (highlights.title || highlights['title.ngram']) || art.title}}></span> ({id}, <a href={`https://collections.artsmia.org/index.php?page=detail&id=${id}`}>#</a>) <Link to="artwork" params={{id: id}}>&rarr;</Link></h1>
        <h2><ClickToSelect><span dangerouslySetInnerHTML={{__html: highlights && (highlights.artist || highlights['artist.ngram']) || art.artist}}></span></ClickToSelect></h2>
        <ArtworkImage art={art} id={id} />
        <p  >{art.room === 'Not on View' ? art.room : <strong>{art.room}</strong>}</p>
        <p className='location'><ClickToSelect>{art.room === 'Not on View' ? art.room : <strong>{art.room}</strong>}</ClickToSelect></p>
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
