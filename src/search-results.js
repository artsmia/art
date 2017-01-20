var React = require('react')
var Router = require('react-router')
var {Link} = require('react-router')
var rest = require('rest')

var SEARCH = require('./endpoints').search
var SearchSummary = require('./search-summary')
var ResultsList = require('./search-results/list')
var ResultsGrid = require('./search-results/grid')

var SearchResults = React.createClass({
  mixins: [Router.State, Router.Navigation],

  statics: {
    fetchData: {
      searchResults: (params, query) => {
        var size = query && query.size || 100
        var sort = query && query.sort
        const filters = params.splat
        const properlyCodedFilters = encodeURIComponent(decodeURIComponent(filters)) // yuck
        let searchUrl = `${SEARCH}/${decodeURIComponent(params.terms)}?size=${size}`
        if(sort) searchUrl += `&sort=${sort}`
        if(filters) searchUrl += `&filters=${properlyCodedFilters}`
        return rest(searchUrl).then((r) => JSON.parse(r.entity))
      }
    }
  },

  getInitialState() {
    var focus = window.clickedArtwork || this.props.hits[0]
    setTimeout(() => window.clickedArtwork = null)
    var smallViewport = window && window.innerWidth <= 500

    var {view, preview: showPreview} = this.props.query
    var initialView = view && view == 'list' ? ResultsList : ResultsGrid
    var defaultView = (smallViewport || this.context.universal) ? ResultsList : ResultsGrid
    var showPreview = showPreview == "false" ? false : true

    return {
      focusedResult: showPreview && focus && focus,
      view: initialView || defaultView,
      smallViewport,
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits ||
      this.props.completions !== nextProps.completions ||
      this.props.query.sort !== nextProps.query.sort ||
      this.state !== nextState
  },

  componentWillReceiveProps(nextProps) {
    var focused = window.clickedArtwork || this.state && this.state.focusedResult || nextProps.hits[0]
    this.focusResult(focused)
    if(window.clickedArtwork) window.clickedArtwork = null
  },

  maxResults: 5000,

  triggerLoad(nextPage) {
    this.setState({loadingMore: nextPage})
  },

  render() {
    var search = this.props.data.searchResults
    var {focusedResult} = this.state
    var leftColumnWidth = '35%'
    var unloadedResults = search.hits.total - this.props.hits.length
    var loadThisManyMore = Math.min(200, unloadedResults)
    var nextPage = Math.min(this.maxResults, this.props.hits.length+loadThisManyMore)
    var showMoreLink = search &&
      <span>.&nbsp;(<Link to={search.filters ? 'filteredSearchResults' : 'searchResults'}
             params={{terms: search.query, splat: search.filters}}
             query={{size: nextPage, ...this.props.query}}
             onClick={this.triggerLoad.bind(this, nextPage)}
            >load {loadThisManyMore} more</Link>)
      </span>

    if(this.state.loadingMore) showMoreLink = ' (…loading)'

    var summaryProps = {
      search: this.props.data.searchResults,
      hits: this.props.hits,
      params: this.props.params,
      showAggs: this.props.showAggs,
      toggleAggs: this.props.toggleAggs,
      showMoreLink,
      maxResults: this.maxResults,
      query: this.props.query,
      ...this.props.summaryProps
    }

    var {terms, splat} = this.props.params
    var showFocusRelatedContent = [terms, splat].join(' ').match(/related/)

    return <div>
      <SearchSummary {...summaryProps}>
        <SearchResultViewToggle
          click={this.changeView}
          activeView={this.state.view}
          views={[ResultsList, ResultsGrid]}
        />
      </SearchSummary>
      {this.props.suggestions}
      <this.state.view
        leftColumnWidth={leftColumnWidth}
        focusedResult={focusedResult}
        focusHandler={this.focusResult}
        search={search}
        hits={this.props.hits}
        postSearch={this.postSearch(summaryProps, this.state.postSearchOffset)}
        smallViewport={this.state.smallViewport}
        showRelated={showFocusRelatedContent}
        />
    </div>
  },

  focusResult(hit, nextView = false) {
    var {smallViewport} = this.state

    if(smallViewport && nextView) {
      this.transitionTo('artwork', {id: hit._id})
    } else {
      !smallViewport && nextView && this.changeView(nextView)
      this.setState({focusedResult: hit ? hit : null})
    }
  },

  changeView(next) {
    next && this.setState({view: next})
  },

  // How to code this: after seeing all the results (on a page?)
  // summarize them and give the chance to do something. Such as:
  // * load more
  // * did you find what you were looking for? (solicit feedback)
  // * related searches?
  //
  // Also fudge the height of this so the right column scroll doesn't get cut off.
  postSearch({hits, search, showMoreLink}, postSearchOffset) {
    var showingAll = hits.length == search.hits.total || hits.length >= this.maxResults

    var style = {
      marginTop: '1em',
      padding: '1em',
      borderTop: '1em solid #232323',
      minHeight: Math.max(50, this.state.minHeight - postSearchOffset)
    }

    return <div ref="postSearch" style={style}>
      showing {hits.length} {' '}
      {showingAll || <span>of {search.hits.total} {' '}</span>}
      results matching <code>{search.query}</code>
      {search.filters && <span> and <code>{search.filters}</code></span>}
      {showingAll || showMoreLink}
    </div>
  },

  componentDidUpdate(prevProps, prevState) {
    var domNode = this.refs.postSearch && React.findDOMNode(this.refs.postSearch)
    var offset = domNode.getBoundingClientRect().top
    if(domNode && offset != prevState.postSearchOffset) {
      this.setState({postSearchOffset: offset || 0})
    }

    if(this.props.query.size == this.state.loadingMore) this.setState({loadingMore: false})
  },

  onHeightChange(newHeight) {
    this.setState({minHeight: newHeight})
  },

  getChildContext() {
    return {
      onHeightChange: this.onHeightChange,
    }
  },
})
SearchResults.childContextTypes = {onHeightChange: React.PropTypes.func}
SearchResults.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
}

module.exports = SearchResults

var SearchResultViewToggle = React.createClass({
  render() {
    var {views, click, activeView} = this.props

    var toggles = views.map((r) => {
      var name = r.displayName.replace('SearchResults', '')
      var activeStyle = activeView === r && {
        color: '#222',
        backgroundColor: 'white',
        borderRadius: 5,
        margin: '0 5px',
        display: 'inline-block',
      } || {}
      return <span key={name} onClick={this.toggleView.bind(this, r)} style={activeStyle}><i className={name}></i></span>
    })

    return <div className="mdl-cell mdl-cell--2-col views">{toggles}</div>
  },

  toggleView(view) {
    this.props.click(view)
  },
})
