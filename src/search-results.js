var React = require('react')
var Router = require('react-router')
var rest = require('rest')

var SearchSummary = require('./search-summary')
var ArtworkResult = require('./artwork-result')
var SEARCH = require('./search-endpoint')
var ArtworkImage = require('./artwork-image')
var Markdown = require('./markdown')

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

  getInitialState() {
    var firstHit = this.props.hits[0]
    return {
      focusedResult: firstHit && firstHit._source,
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits ||
      this.props.state != nextState
  },

  componentWillReceiveProps(nextProps) {
    this.focusResult(nextProps.hits[0])
  },

  render() {
    var search = this.props.data.searchResults
    var results = this.props.hits.map((hit) => {
      var id = hit._source.id.replace('http://api.artsmia.org/objects/', '')
      var focused = this.state.focusedResult === hit._source
      return <div key={id} onClick={this.focusResult.bind(this, hit)} className={focused && 'focused'}>
        <ArtworkResult id={id} data={{artwork: hit._source}} />
      </div>
    })
    var {focusedResult} = this.state

    return (
      <div className='search-results-wrap clearfix'>
        <SearchSummary search={search} hits={this.props.hits} results={results} />
        <div className='objects-wrap' style={{clear: 'both'}}>{results}</div>
        {focusedResult && <div className='objects-focus'>
            <h2>{focusedResult.title}, <span className='date'>{focusedResult.dated}</span></h2>
            <h5>{focusedResult.artist}</h5>
            <ArtworkImage art={focusedResult} id={focusedResult.id} />
            <div className='tombstone'>
              {focusedResult.medium}<br />
              {focusedResult.dimension}<br/>
              {`${focusedResult.creditline} ${focusedResult.accession_number}`}
            </div>
            <Markdown>{focusedResult.text}</Markdown>
        </div>}
      </div>
    )
  },

  focusResult(hit) {
    this.setState({focusedResult: hit._source})
  },
})

module.exports = SearchResults
