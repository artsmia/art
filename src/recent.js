var React = require('react')
var Router = require('react-router')
var {Link} = Router
var Helmet = require('react-helmet')
var rest = require('rest')
var R = require('ramda')

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
      accessionHighlights: (params, query) => rest(`${SEARCH}/accessionHighlight:true?sort=accessionDate-desc`)
      .then(r => JSON.parse(r.entity)),
    }
  },

  accessionHighlightsGrid() {
    var {accessionHighlights, recent} = this.props.data
    const artworks = accessionHighlights.hits.hits
      .map(h => h._source)
      .filter(art => [127658, 126980, 126982, 126983, 126984, 127053, 127055].indexOf(parseInt(art.id)) == -1)
    var groupedByDate = R.groupBy(
      h => {
        const date = h.accessionDate.split('-')[0]
        return date == 2107 ? 2017 : date
      },
      artworks
    ) // {<date>: [<highlights>], …}

    var customImageFunction = (id) =>
      `https://collections.artsmia.org/_info/accession_highlights/${id}.jpg`
    var customImageFunctionIIIF = (id) =>
      `https://iiif.dx.artsmia.org//${id}.jpg/-1,-1,800,800/800,/0/default.jpg`

    return <div>
      {Object.keys(groupedByDate).reverse().map(accessionDate => {
        var highlights = groupedByDate[accessionDate]
        const aspectRatio = parseInt(accessionDate) > 2016 ? {width: 400, height: 300} : {width: 400, height: 400}
        console.info(accessionDate, aspectRatio)
        return <div className="grid_wrapper" key={accessionDate}>
          <h3>{accessionDate.split('-').slice(0, 2).reverse().join('/')}</h3>
          {highlights.filter(highlight => highlight.image === 'valid').map(highlight => {
            return <div className="single_highlight">
              <Link to="accessionHighlight" params={{id: highlight.id, slug: _Artwork.slug(highlight)}}>
                <div className="highlight_image">
                  <div className="highlight_content">
                    <ArtworkImage
                      art={highlight}
                      ignoreStyle={false}
                      style={aspectRatio}
                      lazyLoad={false}
                      customImage={customImageFunctionIIIF} />
                  </div>
                </div>
              </Link>
            </div>
          })}
        </div>
      })}
    </div>
  },

  render() {
    return <div className="new-to-mia">
      <div className="explore-section">
        <h2>Accession Highlights</h2>
        {this.accessionHighlightsGrid()}

        <h2 style={{paddingTop: '3em'}}>All Recent Accessions</h2>
        <Peek
          facet='recent'
          q='true'
          quiltProps={{maxRowHeight: 600}}
          shuffleQuilt={true}
          />
      </div>
      <Helmet title="New to Mia - Acquisition Highlights" />
    </div>
  }
})

module.exports = RecentAccessions
