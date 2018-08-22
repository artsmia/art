var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var { NotFoundRoute, Navigation, State, Link, Route, RouteHandler, DefaultRoute, Redirect } = Router
var rest = require('rest')
var debounce = require('debounce')
var SEARCH = require('./endpoints').search

var ImageQuilt = require('./image-quilt')
var SearchResults = require('./search-results')
var Suggest = require('./suggest')
var searchLanguageMap = require('./search-language')


var Search = React.createClass({
  mixins: [Router.State, Router.Navigation],

  getInitialState() {
    const {blank} = this.props
    const results = this.props.results || this.props.data && this.props.data.searchResults || []
    results || this.props.blank || this.transitionTo('home')

    return {
      results: results,
      terms: blank ? '' : this.props.params && this.props.params.terms && decodeURIComponent(this.props.params.terms),
      hits: results && results.hits && results.hits.hits || [],
      showAggs: this.props.showAggs,
      blank: this.props.blank,
    }
  },

  render() {
    const results = this.state.results
    const hits = results && results.hits && results.hits.hits // this has to be different from `state.hits` so artworks don't change order when hovered in the quilt
    const {universal, smallViewport} = this.context
    const path = this.props.path
    const darkenQuilt = this.props.path && (path.match(/\/search/) || path.match('more') && window && window.innerWidth <= 736)
    const headerArtworks = ImageQuilt.getImagedResults(hits)
    const showQuilt = !darkenQuilt && headerArtworks
    var quiltProps = Object.assign({
      maxRows: this.state.showAggs ? 1 : 2,
      maxWorks: 10,
      artworks: headerArtworks,
      onClick: this.updateFromQuilt,
      disableHover: this.props.hideResults || this.props.disableHover,
      lazyLoad: universal,
      darken: darkenQuilt,
      shuffle: this.props.shuffleQuilt,
    }, this.props.quiltProps || {})

    const idealSearchBoxWidth = Math.max(17, this.state.terms && this.state.terms.length*1.1 || 0)
    const formProps = universal ? {action: "/search/", method: "get"} : {action: ''}
    const simpleSearchBox = <div className='search-wrapper' style={{width: idealSearchBoxWidth + 'em'}}>
      <form {...formProps}><input className='search-input' type="search"
        placeholder="search"
        value={searchLanguageMap(this.state.terms)}
        onKeyDown={this.keyDown}
        onChange={this.throttledSearch}
        onFocus={({target}) => target && target.select()}
        style={{width: '100%', pointerEvents: 'all'}}
        name="q"
        ref="searchInput"
        autoComplete="off"
        list="searchCompletions"
        /></form>
    </div>

    const hideInput = this.props.hideInput && !this.state.activateSearch
    var searchStyles = {
      left: 0,
      right: 0,
      width: '100%',
      textAlign: 'center',
      pointerEvents: 'none',
      display: hideInput ? 'none' : 'inherit',
      padding: this.props.bumpSearchBox ? '0.5em' : '0',
      position: 'relative', 
      zIndex: 4,
    }

    var searchOverQuiltStyles = {
      ...searchStyles,
      position: 'absolute',
      top: '50%',
      transform: "translateY(-50%)",
      WebkitTransform: "translateY(-50%)",
    }

    const searchBox = (
      <div className='quilt-search-wrap' style={showQuilt && {position: 'relative', width: '100%', overflow: 'hidden'} || {}}>
        {showQuilt && <ImageQuilt {...quiltProps} /> || <span className='quilt-wrap dark' style={{display: 'block', minHeight: '3.5rem'}} />}
        <div className='search-wrap'
          style={showQuilt && !this.props.bumpSearchBox ? searchOverQuiltStyles : searchStyles}>
          <div style={{opacity: this.props.hideHeader ? '1' : '0.95'}}>{simpleSearchBox}</div>
        </div>
      </div>
    )

    var aggsProps = {
      showAggs: this.state.showAggs,
      toggleAggs: this.toggleAggs,
    }

    var suggestions = <Suggest
      search={this.props.data && this.props.data.searchResults}
      completions={this.state.completions}
      style={this.props.suggestStyle}
      />

    var {embed} = this.props.query || {}
    var hideSearch = embed

    return (
      <div id="search">
        {!!hideSearch || searchBox}
        {this.props.children}
        {this.props.hideResults && suggestions || <div>
          <SearchResults {...this.props}
            hits={this.state.hits}
            {...aggsProps}
            suggestions={suggestions}
            minHeight={this.state.minHeight}
            embed={embed}
          />
        </div>}
      </div>
    )
  },

  componentWillMount() {
    var update = this.props.onUpdate || this.search
    var {delay} = this.props
    var isDesktop = typeof window.orientation === 'undefined'

    this.debouncedSearch = (delay || isDesktop) ?
      debounce(update, this.props.delay || 3000) :
      undefined
    this.debouncedAutocomplete = debounce(this.autocomplete, 300)
  },

  autocomplete(terms) {
    if(terms == '') return
    rest(`${SEARCH}/autofill/${decodeURIComponent(terms)}`)
    .then((r) => JSON.parse(r.entity) )
    .then(completions => this.setState({completions}))
  },

  componentDidMount() {
    if(this.props.activateInput) {
      this.activateSearch()
    }
    window.lastSearchedTerms = this.state.terms
  },

  throttledSearch(event) {
    var terms = searchLanguageMap(event.target.value)
    this.setState({terms: terms})
    this.debouncedSearch && this.debouncedSearch(terms)
    this.debouncedAutocomplete(terms)
    window.lastSearchedTerms = terms
  },

  search() {
    var terms = this.normalizeTerms(this.state.terms)
    var {facet, searchAll} = this.props
    if(terms === '') return

    var filters = this.props.params && this.props.params.splat
    if(filters && filters.match(/deaccessioned:.?true.?/)) facet = filters
    this.props.onSearch && this.props.onSearch(terms)

    this.transitionTo(
      filters && !searchAll ? 'filteredSearchResults' : 'searchResults', {
        terms: terms,
        splat: filters
      }
    )
  },

  keyDown(event) {
    if(event.key == 'Enter') {
      this.search()
      event.preventDefault()
    }
  },

  componentWillReceiveProps(nextProps) {
    // Replace `terms` with the terms from the current search, so back+forward
    // work correctly. UNLESS the only difference is insignificant whitespace.
    var nextTerms = nextProps.params && nextProps.params.terms || nextProps.terms
    if(this.normalizeTerms() != nextTerms) {
      this.setState({terms: nextTerms})
    }
    const results = nextProps.results || nextProps.data && nextProps.data.searchResults
    this.setState({results, hits: results && results.hits && results.hits.hits || []})
  },

  componentDidUpdate(prevProps) {
    var {activateSearch} = this.props
    if(activateSearch && activateSearch !== this.state.activateSearch) {
      this.activateSearch()
      this.setState({activateSearch: activateSearch})
    }
  },

  normalizeTerms(terms=this.state.terms) {
    return terms && terms.replace(/\s+/, ' ').trim()
  },

  // update `state.hits` to float a hit from the quilt to the top.
  // If no `art` is passed, that means the quilt has lost focus,
  // reset hits to be the searchResults straigt from ES
  updateFromQuilt(art) {
    const hits = this.state.results.hits.hits
    if(art) {
      if(this.props.facet) this.linkToClickedArtwork(this.props.facet, art)
      var index = hits.indexOf(art)+1
      if(hits.indexOf(art) === -1) {
        var sameArtDifferentObject = hits.filter(h => h._id === art._id)
        if(sameArtDifferentObject) index = hits.indexOf(sameArtDifferentObject[0])+1
      }
      var nextHits = ([art].concat(hits))
      nextHits.splice(index, 1)
      this.setState({hits: nextHits || hits})
    }
  },

  linkToClickedArtwork(facet, art) {
    window.clickedArtwork = art
    this.props.onSearch && this.props.onSearch('clicked a link')
    this.transitionTo(facet ? 'filteredSearchResults' : 'searchResults', {terms: '*', splat: facet})
  },

  toggleAggs() {
    this.setState({showAggs: !this.state.showAggs})
  },

  activateSearch() {
    var node = ReactDOM.findDOMNode(this.refs.searchInput)
    if(node) {
      node.focus()
      node.value && node.setSelectionRange(0, node.value.length)
    }
  },
})
Search.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
  smallViewport: React.PropTypes.bool,
}

module.exports = Search
