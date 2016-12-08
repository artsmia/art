var React = require('react')
var Router = require('react-router')
var {Link} = Router
var Helmet = require('react-helmet')
var rest = require('rest')

var Search = require('./search')
var SEARCH = require('./endpoints').search
var ArtworkPreview = require('./artwork-preview')
var ArtworkResult = require('./artwork-result')
var _Artwork = require('./_artwork')
var Peek = require('./peek')
var Markdown = require('./markdown')
var ArtworkImage = require('./artwork-image')

var RecentAccessions = React.createClass({
  statics: {
    fetchData: {
      searchResults: (params, query) => rest(`${SEARCH}/recent:true`)
      .then(r => JSON.parse(r.entity)),
      accessionHighlights: (params, query) => rest(`${SEARCH}/accessionHighlight:true`)
      .then(r => JSON.parse(r.entity)),
    }
  },

  accessionHighlightsGrid() {
    var {accessionHighlights, recent} = this.props.data

    return <div className="explore-section">
      <h2>Accession Highlights</h2>
      <div className="grid_wrapper">{accessionHighlights.hits.hits.map(h => h._source)
        .map(highlight => {
        return <div className="single_highlight">
          <Link to="accessionHighlight" params={{id: highlight.id, slug: _Artwork.slug(highlight)}}>
            <div className="highlight_image">
              <div className="highlight_content">
                <ArtworkImage art={highlight} />
              </div>
            </div>
          </Link>
        </div>
      })}</div>
    </div>
  },

  render() {
    return <div className="new-to-mia">
      {this.accessionHighlightsGrid()}

      <Helmet title="New to Mia - Acquisition Highlights" />
    </div>
  }
})

module.exports = RecentAccessions
