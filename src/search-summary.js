var React = require('react')
var { Link } = require('react-router')
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

    const showAllLink = search &&
      <span>.&nbsp;(<Link to={search.filters ? 'filteredSearchResults' : 'searchResults'}
             params={{terms: search.query, splat: search.filters}}
             query={{size: Math.min(500, search.hits.total)}}>show all</Link>)
      </span>

    const toggleAggs = hits.length > 1 && <span className="filter-button">
      <a onClick={this.toggleAggs} style={{cursor: 'pointer'}}>{showAggs ? 'hide filters' : 'filter search'}</a>
    </span>

    const showingAll = hits.length == search.hits.total

    return (
      <div className='agg-wrap'>
        <div className="toolbar mdl-grid">
        {this.props.children}
        <div className="mdl-cell mdl-cell--9-col mdl-cell--5-col-tablet"><h2 onClick={this.toggleContent}>
          showing {hits.length} {' '}
          {showingAll || <span>of {search.hits.total} {' '}</span>}
          results matching <code>{search.query}</code>
          {search.filters && <span> and <code>{decodeURIComponent(search.filters)}</code></span>}
        </h2></div><div className="mdl-cell mdl-cell--2-col">{toggleAggs}</div>
        </div>

        {showAggs && <Aggregations search={search} />}
        <Decorate search={search} params={this.props.params} />
        <Helmet
          title={`🔍  ${search.query}`}
          meta={[
            {property: "robots", content: "noindex"},
            {property: "og:title", content: `${search.query} | Minneapolis Institute of Art`},
          ]}
          />
      </div>
    )
  },

  toggleAggs() {
    this.props.toggleAggs()
  },
})

module.exports = SearchSummary
