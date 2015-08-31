var React = require('react')
var Router = require('react-router')
var rest = require('rest')

var SEARCH = require('./search-endpoint')
var SearchSummary = require('./search-summary')
var ResultsList = require('./search-results/list')
var ResultsGrid = require('./search-results/grid')

var SearchResults = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: {
      searchResults: (params, query) => {
        var size = query.size || 100
        const filters = params.splat && decodeURIComponent(params.splat)
        let searchUrl = `${SEARCH}/${decodeURIComponent(params.terms)}?size=${size}`
        if(filters) searchUrl += `&filters=${filters}`
        return rest(searchUrl).then((r) => JSON.parse(r.entity))
      }
    }
  },

  getInitialState() {
    var focus = window.clickedArtwork || this.props.hits[0]
    setTimeout(() => window.clickedArtwork = null)
    var defaultView = this.props.universal ? ResultsList : ResultsGrid

    return {
      focusedResult: focus && focus._source,
      view: defaultView,
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits ||
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

    return <div>
      <SearchSummary
        search={this.props.data.searchResults}
        hits={this.props.hits}
        params={this.props.params}
        showAggs={this.props.showAggs}
        toggleAggs={this.props.toggleAggs}>
        <SearchResultViewToggle
          click={this.changeView}
          activeView={this.state.view}
          views={[ResultsList, ResultsGrid]}
        />
      </SearchSummary>
      <this.state.view
        leftColumnWidth={leftColumnWidth}
        focusedResult={focusedResult}
        focusHandler={this.focusResult}
        search={search}
        hits={this.props.hits}
        universal={this.props.universal}
        />
    </div>
  },

  focusResult(hit, nextView = false) {
    nextView && this.changeView(nextView)
    this.setState({focusedResult: hit ? hit._source : null})
  },

  changeView(next) {
    next && this.setState({view: next})
  },
})

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
      } || {}
      return <span key={name} onClick={this.toggleView.bind(this, r)} style={activeStyle}><i className={name}></i></span>
    })

    return <div className="mdl-cell mdl-cell--1-col views">{toggles}</div>
  },

  toggleView(view) {
    this.props.click(view)
  },
})
