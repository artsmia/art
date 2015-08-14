var React = require('react')
var Router = require('react-router')
var { NotFoundRoute, Navigation, State, Link, Route, RouteHandler, DefaultRoute, Redirect } = Router
var rest = require('rest')
var debounce = require('debounce')
var SEARCH = require('./search-endpoint')

var ImageQuilt = require('./image-quilt')
var SearchResults = require('./search-results')


var Search = React.createClass({
    
  mixins: [Router.State, Router.Navigation],

  statics: {
    fetchData: (params, query) => {
      let searchUrl = `${SEARCH}/highlight:true`
      return rest(searchUrl).then((r) => JSON.parse(r.entity))
    }
  },

  getInitialState() {
    const results = this.props.data.searchResults
    return {
      terms: this.props.params.terms,
      hits: results && results.hits && results.hits.hits || [],
    }
  },

  render() {
    const quiltProps = this.props.params.terms ? [2, 10] : [3, 30]
    this.props.data.searchResults = this.props.data.searchResults || this.props.data.search
    const results = this.props.data.searchResults
    const hits = results && results.hits && results.hits.hits // this has to be different from `state.hits` so artworks don't change order when hovered in the quilt
    const headerArtworks = hits && hits
      .filter((hit) => hit._source.image == 'valid' && hit._source.image_width > 0)
    const showQuilt = (headerArtworks && headerArtworks.length >= 2)
    const simpleSearchBox = <div className='mdl-textfield mdl-js-textfield'><input className='mdl-textfield__input' type="search" placeholder="search for something" value={this.state.terms} onKeyDown={this.keyDown} onChange={this.throttledSearch} style={{fontSize: '1.5em', width: '100%', maxWidth: '500px', pointerEvents: 'all'}} /></div>

    const searchBox = (
      <div className='quilt-search-wrap' style={showQuilt && {position: 'relative', width: '100%', overflow: 'hidden'} || {}}>
        <div className='search-wrap' style={showQuilt && {position: 'absolute', top: '20vh', left: 0, right: 0, width: '100%', textAlign: 'center', marginTop: '-1em', pointerEvents: 'none'} || {}}>
            <div>
                {simpleSearchBox}
            </div>
        </div>
        {showQuilt && <ImageQuilt maxRows={quiltProps[0]} maxWorks={quiltProps[1]} artworks={headerArtworks} onClick={this.updateFromQuilt} />}
      </div>
    )

    return (
      <div id="search">
        <header><div className='logo-container'></div><div className='wordmark-container'></div></header>
        {searchBox}
        <SearchResults {...this.props} hits={this.state.hits} />
      </div>
    )
  },

  componentWillMount() {
    this.debouncedSearch = debounce(this.search, 1000)
  },

  throttledSearch(event) {
    var terms = event.target.value
    this.setState({terms: terms})
    this.debouncedSearch()
  },

  search() {
    this.transitionTo('searchResults', {terms: this.normalizeTerms(this.state.terms)})
  },

  keyDown(event) {
    if(event.key == 'Enter') this.search()
  },

  componentWillReceiveProps(nextProps) {
    // Replace `terms` with the terms from the current search, so back+forward
    // work correctly. UNLESS the only difference is insignificant whitespace.
    if(this.normalizeTerms() != nextProps.params.terms) {
      this.setState({terms: nextProps.params.terms})
    }
    const results = nextProps.data.searchResults
    this.setState({hits: results && results.hits && results.hits.hits || []})
  },

  normalizeTerms(terms=this.state.terms) {
    return terms && terms.replace(/\s+/, ' ').trim()
  },

  // update `state.hits` to float a hit from the quilt to the top.
  // If no `art` is passed, that means the quilt has lost focus,
  // reset hits to be the searchResults straigt from ES
  updateFromQuilt(art) {
    const hits = this.props.data.searchResults.hits.hits
    if(art) {
      const index = hits.indexOf(art)+1
      var nextHits = ([art].concat(hits))
      nextHits.splice(index, 1)
    }
    this.setState({hits: nextHits || hits})
  },
})

module.exports = Search
