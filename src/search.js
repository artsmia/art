var React = require('react')
var Router = require('react-router')
var { NotFoundRoute, Navigation, State, Link, Route, RouteHandler, DefaultRoute, Redirect } = Router
var rest = require('rest')
var debounce = require('debounce')
var SEARCH = require('./search-endpoint')

var ImageQuilt = require('./image-quilt')
var SearchResults = require('./search-results')

let mui = require('material-ui')
let ThemeManager = new mui.Styles.ThemeManager()
let AppBar = mui.AppBar;

var Search = React.createClass({
    
    childContextTypes: {
        muiTheme: React.PropTypes.object
    },
    
    getChildContext: function() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    },
    componentWillMount() {
        ThemeManager.setPalette({
            accent1Color: Colors.deepOrange500
        });
    },

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
    const simpleSearchBox = <input type="search" placeholder="search for something" value={this.state.terms} onKeyDown={this.keyDown} onChange={this.throttledSearch} style={{fontSize: '2em', width: '100%', maxWidth: '11em'}} />
    const searchBox = (
      <div className='quilt-search-wrap' style={showQuilt && {position: 'relative', width: '100%', overflow: 'hidden'} || {}}>
        <div className='search-wrap' style={showQuilt && {position: 'absolute', top: '50%', left: 0, right: 0, width: '100%', textAlign: 'center', marginTop: '-1em'} || {}}>
          {simpleSearchBox}
        </div>
        {showQuilt && <ImageQuilt maxRows={quiltProps[0]} maxWorks={quiltProps[1]} artworks={headerArtworks} onClick={this.updateFromQuilt} />}
      </div>
    )

    return (
      <div id="search">
        <AppBar
         title="Collections 2015" 
         className="main-app-bar"
         style={{
             backgroundColor: '#3a3737'
         }}
         />
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
