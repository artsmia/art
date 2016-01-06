var React = require('react')
var Helmet = require('react-helmet')

var Decorate = require('./decorate')
var Aggregations = require('./aggregations')

const SearchSummary = React.createClass({
  render() {
    const search = this.props.search
    if(!search || !search.hits) return <div />
    const hits = this.props.hits
    const results = this.props.results
    const {showAggs} = this.props

    const toggleAggs = hits.length > 1 && <span className="filter-button">
      <a onClick={this.toggleAggs} style={{cursor: 'pointer'}}>{showAggs ? 'hide filters' : 'filter search'}</a>
    </span>

    const showingAll = hits.length == search.hits.total

    var smallViewport = window && window.innerWidth <= 500
    var toolbarClasses = "summaryText mdl-cell " + (smallViewport ?
      "mdl-cell--4-col" :
      "mdl-cell--8-col mdl-cell--4-col-tablet")

    var pretty = {
      query: searchLanguageMap(search.query),
      filters: searchLanguageMap(search.filters),
    }
    pretty['searchString'] = [pretty.query, pretty.filters]
      .filter(string => !!string)
      .join(', ')

    return (
      <div className='agg-wrap'>
        <div className="toolbar mdl-grid">
        {this.props.children}
        <div className={toolbarClasses}><h2 onClick={this.toggleContent}>
          showing {hits.length} {' '}
          {showingAll || <span>of {search.hits.total} {' '}</span>}
          results matching <code>{pretty.query}</code>
          {search.filters && <span> and <code>{decodeURIComponent(pretty.filters)}</code></span>}
          {showingAll || this.props.showMoreLink}
        </h2></div><div className="mdl-cell mdl-cell--2-col">{toggleAggs}</div>
        </div>

        {showAggs && <Aggregations search={search} />}
        <Decorate search={search} params={this.props.params} {...this.props} />
        <Helmet
          title={`${pretty.searchString}`}
          meta={[
            {property: "robots", content: "noindex"},
            {property: "og:title", content: `${pretty.searchString} | Minneapolis Institute of Art`},
          ]}
          />
      </div>
    )
  },

  toggleAggs() {
    this.props.toggleAggs()
  },
})

var searchLanguageMap = (queryText) => {
  var map = {
    'recent:true': "Recent Accessions",
    'highlight:true': "Museum Highlights",
    'deaccessioned:"true"': "Deaccessioned",
    '_exists_:"provenance"': "provenance information exists",
    '_exists_:"related:conservation"': 'Conserved artworks',
    '_exists_:"related:artstories"': "ArtStories",
    '_exists_:"related:newsflashes"': "NewsFlashes",
    '_exists_:"related:audio-stops"': "Audio stops",
    '_exists_:"related:stories"': "Mia Stories",
    'room:G*': 'On View',
    'room:"Not on View"': 'Not on View',
    'image:valid': "Image Available",
    'image:invalid': "Image Unavailable",
  }

  return map[queryText] || queryText
}

module.exports = SearchSummary
