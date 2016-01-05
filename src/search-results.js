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
        const filters = params.splat
        let searchUrl = `${SEARCH}/${decodeURIComponent(params.terms)}?size=${size}`
        if(filters) searchUrl += `&filters=${encodeURIComponent(filters)}`
        return rest(searchUrl).then((r) => JSON.parse(r.entity))
      }
    }
  },

  getInitialState() {
    var focus = window.clickedArtwork || this.props.hits[0]
    setTimeout(() => window.clickedArtwork = null)
    var smallViewport = window && window.innerWidth <= 500
    var defaultView = (smallViewport || this.context.universal) ? ResultsList : ResultsGrid

    return {
      focusedResult: focus && focus._source,
      view: defaultView,
      smallViewport,
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits ||
      this.props.completions !== nextProps.completions ||
      this.props.state != nextState
  },

  componentWillReceiveProps(nextProps) {
    this.focusResult(window.clickedArtwork || nextProps.hits[0])
    if(window.clickedArtwork) window.clickedArtwork = null
  },

  render() {
    var search = this.props.data.searchResults
    var {focusedResult} = this.state
    var leftColumnWidth = '35%'
    var unloadedResults = search.hits.total - this.props.hits.length
    var loadThisManyMore = Math.min(200, unloadedResults)
    var showMoreLink = search &&
      <span>.&nbsp;(<Link to={search.filters ? 'filteredSearchResults' : 'searchResults'}
             params={{terms: search.query, splat: search.filters}}
             query={{size: Math.min(500, this.props.hits.length+loadThisManyMore)}}>load {loadThisManyMore} more</Link>)
      </span>

    var summaryProps = {
      search: this.props.data.searchResults,
      hits: this.props.hits,
      params: this.props.params,
      showAggs: this.props.showAggs,
      toggleAggs: this.props.toggleAggs,
      showMoreLink,
      ...this.props.summaryProps
    }

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
        postSearch={this.postSearch(summaryProps)}
        smallViewport={this.state.smallViewport}
        showRelated={this.props.params.terms.match(/related/)}
        />
    </div>
  },

  focusResult(hit, nextView = false) {
    var {smallViewport} = this.state

    if(smallViewport && nextView) {
      this.transitionTo('artwork', {id: hit._id})
    } else {
      !smallViewport && nextView && this.changeView(nextView)
      this.setState({focusedResult: hit ? hit._source : null})
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
  postSearch({hits, search, showMoreLink}) {
    var showingAll = hits.length == search.hits.total
    var style = {
      minHeight: '59vh',
      marginTop: '1em',
      padding: '1em',
      borderTop: '1em solid #232323',
    }

    return <div style={style}>
      showing {hits.length} {' '}
      {showingAll || <span>of {search.hits.total} {' '}</span>}
      results matching <code>{search.query}</code>
      {search.filters && <span> and <code>{search.filters}</code></span>}
      {showingAll || showMoreLink}
    </div>
  },
})
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
