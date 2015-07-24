var React = require('react')
var { Link } = require('react-router')

var Aggregations = require('./aggregations')

const SearchSummary = React.createClass({
  getInitialState() {
    return {
      showAggs: false,
    }
  },

  render() {
    const search = this.props.search
    if(!search || !search.hits) return <div />
    const hits = this.props.hits
    const results = this.props.results
    const {showAggs} = this.state

    const showAllLink = search &&
      <span>.&nbsp;(<Link to={search.filters ? 'filteredSearchResults' : 'searchResults'}
             params={{terms: search.query, splat: search.filters}}
             query={{size: search.hits.total}}>show all</Link>)
      </span>

    const toggleAggs = hits.length > 0 && <span>
      &nbsp; (<a onClick={this.toggleAggs} style={{cursor: 'pointer'}}>{showAggs ? 'hide filters' : 'filter search'}</a>)
    </span>

    const showingAll = hits.length == search.hits.total
    return (
      <div className='agg-wrap'>
        <h2>
          showing {hits.length} {' '}
          {showingAll || <span>of {search.hits.total} {' '}</span>}
          results matching <code>{search.query}</code>
          {search.filters && <span> and <code>{search.filters}</code></span>}
          {showingAll || {showAllLink}}
          {toggleAggs}
        </h2>
        {showAggs && <Aggregations search={search} />}
      </div>
    )
  },

  toggleAggs() {
    this.setState({showAggs: !this.state.showAggs})
  },
})

module.exports = SearchSummary
