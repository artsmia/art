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
    const headerArtworks = ImageQuilt.getImagedResults(hits)
    const showQuilt = (headerArtworks)
    var quiltProps = Object.assign({
      maxRows: this.state.showAggs ? 1 : 2,
      maxWorks: 10,
      artworks: headerArtworks,
      onClick: this.updateFromQuilt,
      disableHover: this.props.hideResults,
      lazyLoad: !this.context.universal,
    }, this.props.quiltProps || {})

    const nakedSimpleSearchBox = <div className='mdl-textfield mdl-js-textfield'>
      <input className='mdl-textfield__input' type="search"
        placeholder="search for something"
        value={this.state.terms}
        onKeyDown={this.keyDown}
        onChange={this.throttledSearch}
        style={{fontSize: '1.5em', width: '100%', maxWidth: '500px', pointerEvents: 'all'}}
        name="q"
        ref="searchInput"
        />
    </div>

    const simpleSearchBox = this.context.universal ?
      <form action="/search/" method="get">{nakedSimpleSearchBox}</form> :
      nakedSimpleSearchBox

    var quiltSearchStyles = {
      position: 'absolute',
      top: '50%',
      transform: "translateY(-50%)",
      WebkitTransform: "translateY(-50%)",
      left: 0,
      right: 0,
      width: '100%',
      textAlign: 'center',
      pointerEvents: 'none'
    }

    const searchBox = (
      <div className='quilt-search-wrap' style={showQuilt && {position: 'relative', width: '100%', overflow: 'hidden'} || {}}>
        <div className='search-wrap' ref="test" style={showQuilt && quiltSearchStyles || {}}>
          <div>{simpleSearchBox}</div>
        </div>
        {showQuilt && <ImageQuilt {...quiltProps} />}
      </div>
    )

    var aggsProps = {
      showAggs: this.state.showAggs,
      toggleAggs: this.toggleAggs,
    }

    return (
      <div id="search">
        {searchBox}
        {this.props.children}
        {this.props.hideResults || <div>
          <SearchResults {...this.props} hits={this.state.hits} {...aggsProps} />
        </div>}
      </div>
    )
  },

  componentWillMount() {
    var update = this.props.onUpdate || this.search
    this.debouncedSearch = (typeof window.orientation === 'undefined') ?
      debounce(update, 1000) :
      undefined
  },

  componentDidMount() {
    if(this.props.activateInput) {
      this.activateSearch()
    }
  },

  throttledSearch(event) {
    var terms = event.target.value
    this.setState({terms: terms})
    this.debouncedSearch && this.debouncedSearch(terms)
  },

  search() {
    var terms = this.normalizeTerms(this.state.terms)
    this.props.onSearch && this.props.onSearch(terms)
    if(terms !== '') this.transitionTo('searchResults', {terms: terms})
  },

  keyDown(event) {
    if(event.key == 'Enter') this.search()
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
      if(this.props.link) this.linkToClickedArtwork(this.props.link, art)
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

  linkToClickedArtwork(link, art) {
    window.clickedArtwork = art
    this.props.onSearch && this.props.onSearch('clicked a link')
    this.transitionTo(...link)
  },

  toggleAggs() {
    this.setState({showAggs: !this.state.showAggs})
  },

  activateSearch() {
    var node = React.findDOMNode(this.refs.searchInput)
    node.focus()
    node.value && node.setSelectionRange(0, node.value.length)
  },
})
Search.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
}

module.exports = Search
