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
  },

  willTransitionTo: Artwork.willTransitionTo,

  render() {
    var {artwork: art} = this.props.data

    return <div>
      <Artwork {...this.props} accessionHighlightView={true}>
        <ArtworkPreview art={art} showDuplicateDetails={true}>
          <div className="description" itemProp="description">
            <Markdown>{art.accessionHighlightText}</Markdown>
          </div>
        </ArtworkPreview>
        <div className="back-button"><Link to="artworkSlug" params={{id: art.id, slug: art.slug}}>View full collection record</Link></div>
        <div className="back-button"><Link to="/new">Back to Accession Highlights</Link></div>
      </Artwork>
    </div>
  }
})

module.exports = AccessionHighlight
