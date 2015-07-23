var React = require('react')
var Router = require('react-router')
var rest = require('rest')

var SearchSummary = require('./search-summary')
var ArtworkResult = require('./artwork-result')
var SEARCH = require('./search-endpoint')

var SearchResults = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: (params, query) => {
      var size = query.size || 100
      const filters = params.splat
      let searchUrl = `${SEARCH}/${params.terms}?size=${size}`
      if(filters) searchUrl += `&filters=${filters}`
      return rest(searchUrl).then((r) => JSON.parse(r.entity))
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits
  },

  render() {
    var search = this.props.data.searchResults
    var results = this.props.hits.map((hit) => {
      var id = hit._source.id.replace('http://api.artsmia.org/objects/', '')
      return <div key={id}><ArtworkResult id={id} data={{artwork: hit._source}} highlights={hit.highlight} /><hr/></div>
    })

    return (
      <div className='search-results-wrap clearfix'>
        <SearchSummary search={search} hits={this.props.hits} results={results} />
        <div className='objects-wrap' style={{clear: 'both'}}>{results}</div>
        <div className='objects-focus'>
            <h2>The Death of Germanicus</h2>
            <h5>Nicholas Poussin</h5>
            <img src="http://placehold.it/800x800" />
        </div>
      </div>
    )
  }
})

module.exports = SearchResults
