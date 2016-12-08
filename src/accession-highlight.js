var React = require('react')
var Router = require('react-router')
var {Link} = Router

var Artwork = require('./artwork')
var ArtworkPreview = require('./artwork-preview')
var Markdown = require('./markdown')

var AccessionHighlight = React.createClass({
  mixins: Artwork.mixins,
  statics: {
    fetchData: Artwork.fetchData,
    willTransitionTo: (transition, params, query, callback) => {
      Artwork.checkRoute(params, (err, art) => {
        if(!art.accessionHighlight) transition.redirect('artworkSlug', params)
        if(err) transition.redirect('accessionHighlight', params)
      })
      .then(callback)
    },
  },

  render() {
    var {artwork: art} = this.props.data
    var accDate = new Date(art.accessionDate)
    var accDateString = `${accDate.getFullYear()}`

    return <div>
      <Artwork {...this.props} accessionHighlightView={true}>
        <ArtworkPreview art={art} showDuplicateDetails={true}>
          <div className="description" itemProp="description" style={{'borderTop':'4px solid #232323', 'borderBottom':'4px solid #232323', 'padding':'4px 0', 'margin':'10px 0'}}>
            <h2>{accDateString} Accession Highlight</h2>
            <Markdown>{art.accessionHighlightText}</Markdown>
          </div>
        </ArtworkPreview>
        <div className="back-button" style={{marginRight: '.5em'}}><a href="#" onClick={() => history.go(-1)}><i className="material-icons">arrow_back</i> back</a></div>
        <div className="back-button"><Link to="artworkSlug" params={{id: art.id, slug: art.slug}}>view details <i className="material-icons">arrow_forward</i></Link></div>

      </Artwork>
      {Artwork.pageMetadata(art, 'Accession Highlight: ')}
    </div>
  }
})

module.exports = AccessionHighlight
