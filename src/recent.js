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
        const accessionNumberYear = h.accession_number.split('.')[0]
        // This was needed to group accessions by quarter, but we are using year now so fall back to the accesion number
        const accessionDateYear = h.accessionDate.split('-')[0]
        const date = accessionNumberYear
        return date == 2107 ? 2017 : date
      },
      artworks
    ) // {<date>: [<highlights>], …}

    var customImageFunctionStatic = (id) =>
      `https://collections.artsmia.org/_info/accession_highlights/${id}.jpg`
    var customImageFunctionSmartCrop = (id) =>
      `https://iiif.dx.artsmia.org//${id}.jpg/-1,-1,800,800/800,/0/default.jpg`
    // combine 'static' and 'IIIF smart crop' with custom IIIF hand-crops
    var customCrops = `
      https://iiif.dx.artsmia.org/128386.jpg/4670,4987,2147,1890/800,/0/default.jpg
      https://iiif.dx.artsmia.org/129702.jpg/2687,2039,3112,3080/800,/0/default.jpg
      https://iiif.dx.artsmia.org/128360.jpg/3448,1206,1389,1279/800,/0/default.jpg
      https://iiif.dx.artsmia.org/128390.jpg/6047,2248,1675,1641/800,/0/default.jpg
      https://iiif.dx.artsmia.org/128682.jpg/2934,1256,1155,1184/800,/0/default.jpg
      https://iiif.dx.artsmia.org/130109.jpg/1247,3512,2340,2294/800,/0/default.jpg
      https://iiif.dx.artsmia.org/128091.jpg/1230,1243,2532,2506/800,/0/default.jpg
      https://iiif.dx.artsmia.org/128430.jpg/5195,3201,2320,2157/800,/0/default.jpg
      https://iiif.dx.artsmia.org/129758.jpg/1487,1554,2787,2587/800,/0/default.jpg
      https://iiif.dx.artsmia.org/131786.jpg/1741,4474,1781,1696/800,/0/default.jpg
      https://iiif.dx.artsmia.org/136410.jpg/575,333,738,768/800,/0/default.jpg
      https://iiif.dx.artsmia.org/131334.jpg/2719,2393,1519,1474/800,/0/default.jpg
      https://iiif.dx.artsmia.org/132174.jpg/2399,2019,1838,1706/800,/0/default.jpg
      https://iiif.dx.artsmia.org/136221.jpg/445,6119,2527,2264/800,/0/default.jpg
      https://iiif.dx.artsmia.org/131646.jpg/2675,635,3645,3634/800,/0/default.jpg
      https://iiif.dx.artsmia.org/136392.jpg/2425,574,1277,1186/800,/0/default.jpg
      https://iiif.dx.artsmia.org/131330.jpg/1854,279,3047,3064/800,/0/default.jpg
      https://iiif.dx.artsmia.org/126884.jpg/988,601,2786,2376/800,/0/default.jpg
      https://iiif.dx.artsmia.org/126818.jpg/22,200,5367,4577/800,/0/default.jpg
      https://iiif.dx.artsmia.org/124782.jpg/563,69,4357,3716/800,/0/default.jpg
      https://iiif.dx.artsmia.org/123915.jpg/561,591,3983,3396/800,/0/default.jpg
      https://iiif.dx.artsmia.org/123335.jpg/891,57,4881,4162/800,/0/default.jpg
    `.split(/\s+/).filter(url => url !== '')
    // If a custom detail URL was included above, use that.
    // Otherwise, try the IIIF smart crop
    var customImageFunction = (id) => {
      return customCrops.find(iiifUrl => iiifUrl.match(`${id}.jpg`)) || customImageFunctionSmartCrop(id)
    }

    return <div>
      {Object.keys(groupedByDate).reverse().map(accessionDate => {
        var highlights = groupedByDate[accessionDate]
        const aspectRatio = parseInt(accessionDate) > 2016 ? {width: 400, height: 300} : {width: 400, height: 400}

        return <div className="grid_wrapper" key={accessionDate}>
          <h3>{accessionDate.split('-').slice(0, 2).reverse().join('/')}</h3>
          {highlights.filter(highlight => highlight.image === 'valid').map((highlight, index) => {
            return <div className="single_highlight">
              <Link to="accessionHighlight" params={{id: highlight.id, slug: _Artwork.slug(highlight)}}>
                <div className="highlight_image">
                  <div className="highlight_content">
                    <ArtworkImage
                      art={highlight}
                      ignoreStyle={false}
                      style={{maxWidth: '111%', maxHeight: '111%'}}
                      containerStyle={{maxWidth: '100%', maxHeight: '100%', overflow: 'hidden'}}
                      lazyLoad={index > 1} // load the first 2 straight up and lazy load the rest
                      customImage={customImageFunction} />
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
