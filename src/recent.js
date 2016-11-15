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

    return <div style={{margin: '5em'}}>
      <h1>Accession Highlights</h1>
      <ul>{accessionHighlights.hits.hits.map(h => h._source)
        .map(highlight => {
        return <li>
          <Link to="accessionHighlight" params={{id: highlight.id, slug: _Artwork.slug(highlight)}}>
            <h3>{highlight.title}</h3>
            {highlight.image == 'valid' && <ArtworkImage art={highlight} />}
          </Link>
          <Markdown>{highlight.accessionHighlightText}</Markdown>
        </li>
      })}</ul>
    </div>
  },

  render() {
    return <div>
    {false && <Search
        facet={'recent:true'}
        {...this.props}
        hideInput={true}
        hideResults={true} />}

      {this.accessionHighlightsGrid()}

      <Peek facet="recent" q="true" quiltProps={{maxRowHeight: 400}} offset={10}/>
      <Helmet title="New to Mia - Acquisition Highlights" />
    </div>
  }
})

module.exports = RecentAccessions

