var React = require('react')
var Router = require('react-router')
var { NotFoundRoute, Navigation, State, Link, Route, RouteHandler, DefaultRoute, Redirect } = Router
var rest = require('rest')
var debounce = require('debounce')
var SEARCH = require('./search-endpoint')

var ImageQuilt = require('./image-quilt')
var SearchResults = require('./search-results')
var SearchSummary = require('./search-summary')

var Search = React.createClass({

  mixins: [Router.State, Router.Navigation],

  getInitialState() {
    const results = this.props.data.searchResults
    return {
      terms: this.props.params.terms,
      hits: results && results.hits && results.hits.hits || [],
      showAggs: this.props.showAggs,
    }
  },

  render() {
    const results = this.props.data.searchResults || this.props.data.home || this.props.data.department
    const hits = results && results.hits && results.hits.hits // this has to be different from `state.hits` so artworks don't change order when hovered in the quilt
    const headerArtworks = ImageQuilt.getImagedResults(hits)
    const showQuilt = (headerArtworks)
    var quiltProps = Object.assign({
      maxRows: this.state.showAggs ? 1 : 2,
      maxWorks: 10,
      artworks: headerArtworks,
      onClick: this.updateFromQuilt,
    }, this.props.quiltProps || {})
    console.info('search', quiltProps)
    const simpleSearchBox = <div className='mdl-textfield mdl-js-textfield'><input className='mdl-textfield__input' type="search" placeholder="search for something" value={this.state.terms} onKeyDown={this.keyDown} onChange={this.throttledSearch} style={{fontSize: '1.5em', width: '100%', maxWidth: '500px', pointerEvents: 'all'}} /></div>

    var quiltSearchStyles = {
      position: 'absolute',
      top: '50%',
      transform: "translateY(-50%)",
      left: 0,
      right: 0,
      width: '100%',
      textAlign: 'center',
      pointerEvents: 'none'
    }

    const searchBox = (
      <div className='quilt-search-wrap' style={showQuilt && {position: 'relative', width: '100%', overflow: 'hidden'} || {}}>
        <div className='search-wrap' style={showQuilt && quiltSearchStyles || {}}>
          <div>{simpleSearchBox}</div>
        </div>
        {showQuilt && <ImageQuilt {...quiltProps} />}
      </div>
    )

    return (
      <div id="search">
        {searchBox}
        {this.props.hideResults || <div>
          <SearchSummary
            search={this.props.data.searchResults}
            hits={this.state.hits}
            params={this.props.params}
            showAggs={this.state.showAggs}
            toggleAggs={this.toggleAggs} />
          <SearchResults {...this.props} hits={this.state.hits} />
        </div>}
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
    var terms = this.normalizeTerms(this.state.terms)
    if(terms !== '') this.transitionTo('searchResults', {terms: terms})
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

  toggleAggs() {
    this.setState({showAggs: !this.state.showAggs})
  },
})

module.exports = Search
