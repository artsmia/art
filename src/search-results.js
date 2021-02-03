var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var {Link} = require('react-router')
var rest = require('rest')

var SEARCH = require('./endpoints').search
var SearchSummary = require('./search-summary')
var ResultsList = require('./search-results/list')
var ResultsGrid = require('./search-results/grid')

function omitResultsById(...ids) {
  return (json) => {
    return {
      ...json,
      hits: {
        ...json.hits,
        hits: json.hits.hits.filter(hit => !ids.find(id => id === parseInt(hit._id))),
      },
    }
  }
}
/* Given a list of artwork ids to be promoted, find any that exist
 * in `results` and increase their _score, then re-sort the results
 */
function promoteResultsById(...ids) {
  return function(json, additionalArt) {
    const idComparison = hit => ids.indexOf(Number(hit._id)) > -1
    const hits = [
      ...json.hits.hits,
      ...additionalArt.map(art => ({
        _score: 100,
        _source: art,
      }))
    ]
    const includesId = hits.filter(idComparison)
    const resortedResults = hits.map(hit => {
      if(idComparison(hit)) hit._score = hit._score * 100

      return hit
    }).sort((a, b) => b._score - a._score)

    return {
      ...json,
      hits: {
        ...json.hits,
        hits: resortedResults,
      },
    }
  }
}
function reshapeResultsJson(json) {
  // For this query there are two photographs that are included because of `2013`
  // being included in their title, that really don't belong and are a thorn in
  // the side of one of our curators.
  //
  // Manually remove ids 126303 and 126745 from a search where the query starts with
  // 2013.29
  if(json.query.match(/^2013.29/)) {
    return omitResultsById(126303, 126745)(json)
  }

  if(json.query.match(/black|african.?american/i)) {
    // TODO how to do this without hard-coding a single artwork?
    const gfPortrait = JSON.parse(`{"id":"139005","title":"George Floyd, In Memorium 2020","medium":"Screenprint","classification":" Prints","dimension":"25 × 15 in. (63.5 × 38.1 cm) (sheet)","object_name":"Print","continent":"North America","country":"United States","culture":null,"dated":"2020","room":"Not on View","style":"21st century","inscription":"LLC in pencil: 8:46","signed":"LRC in pencil: David Barthold","markings":"bottom center in pencil: 113/200","text":"As Minneapolis and the world mourned the murder of George Floyd in the summer of 2020, an outpouring of art was created by artists, professional and amateur alike—murals, sidewalk art, sculpture installations, cardboard signs, paintings, drawings, and prints. The works were made to memorialize Floyd and countless other Black citizens martyred in this country, to protest racial injustice and police brutality, and to try to help communities heal. Barthold, a New York printmaker and street artist, completed this powerful memorial portrait of Floyd just days after he was killed. The artist subsequently produced other portrait prints of important Americans—John Lewis, Fred Hampton, Ruth Bader Ginsburg, and Alexandria Ocasio-Cortez—to, in the artist’s words, “remember the lost and honor the living.” Barthold mass-produced these likenesses and pasted them around the city of New York throughout the summer of 2020, and, again, in a campaign just before the 2020 election. To broaden their reach, he shared the images on social media, and sold the prints online, using the proceeds to raise money for Black Lives Matter and the Bail Project.","description":"portrait of George Floyd in black inside an irregularly shaped dark form","provenance":"The artist, New York (2020; sold to McGarry); Rachel McGarry, Deephaven (2020; given to Mia).","portfolio":"From ","creditline":"Anonymous gift","accession_number":"2020.91","artist":"Artist: David Barthold","role":"Artist","nationality":"American","life_date":"American, born 1959","image_copyright":"","department":"Prints and Drawings","rights_type":"Copyright Not Evaluated","image":"valid","image_width":4823,"image_height":7846,"restricted":1,"public_access":"1","curator_approved":0,"catalogue_raissonne":null,"art_champions_text":null,"see_also":[""]}`)

    return promoteResultsById(139005, 7890, 3754, 107241, 126991, 79932)(json, [gfPortrait])
  }

  return json
}

var SearchResults = React.createClass({
  mixins: [Router.State, Router.Navigation],

  statics: {
    fetchData: {
      searchResults: (params, query) => {
        var size = query && query.size || 100
        var sort = query && query.sort
        const filters = params.splat
        const properlyCodedTerms = params.terms.replace(/\/|%2F/g, ' ') // no forward slashes in search `/`
        const properlyCodedFilters = encodeURIComponent(decodeURIComponent(filters)) // yuck
        let searchUrl = `${SEARCH}/${properlyCodedTerms}?size=${size}`
        if(sort) searchUrl += `&sort=${sort}`
        if(filters) searchUrl += `&filters=${properlyCodedFilters}`
        if(window && window.enteredViaMore || query && query.more) searchUrl += `&tag=more`
        return rest(searchUrl).then((r) => reshapeResultsJson(JSON.parse(r.entity)))
      }
    }
  },

  getInitialState() {
    var focus = window.clickedArtwork || this.props.hits[0]
    setTimeout(() => window.clickedArtwork = null)
    var {smallViewport} = this.context

    var isInspiredByMia = this.isInspiredByMia()

    var {view, preview: showPreview} = this.props.query
    var initialView = (view && view == 'list' || smallViewport || this.context.universal) ?
      ResultsList :
      ResultsGrid

    var showPreview = (showPreview == "false" || isInspiredByMia) ? false : true

    return {
      focusedResult: showPreview && focus && focus,
      view: initialView,
      isInspiredByMia,
    }
  },

  isInspiredByMia() {
    var search = this.props.data.searchResults
    var { query, filters } = search
    var inspiredFragment = '_exists_:"related:inspiredByMia"'

    return query && query.match(inspiredFragment) || filters && filters.match(inspiredFragment)
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits ||
      this.props.completions !== nextProps.completions ||
      this.props.query.sort !== nextProps.query.sort ||
      this.state !== nextState
  },

  componentWillReceiveProps(nextProps) {
    var { showPreview } = this.state
    var focused =
      window.clickedArtwork
      || this.state && this.state.focusedResult
      || showPreview && nextProps.hits[0]
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
    var {smallViewport} = this.context
    var unloadedResults = Math.max(0, search.hits.total - this.props.hits.length)
    var loadThisManyMore = Math.min(200, unloadedResults)
    var nextPage = Math.min(this.maxResults, this.props.hits.length+loadThisManyMore)
    var nextPageQuery = {...this.props.query, size: nextPage}
    var showMoreLink = search &&
      <span>.&nbsp;(<Link to={search.filters ? 'filteredSearchResults' : 'searchResults'}
             params={{terms: search.query, splat: search.filters}}
             query={nextPageQuery}
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
      forceSearchUpdate: (nextFocusResult) => {
        this.focusResult(nextFocusResult)
      },
      embed: this.props.embed,
      handleCancelEmbed: this.props.handleCancelEmbed,
      isInspiredByMia: this.state.isInspiredByMia,
      ...this.props.summaryProps
    }

    var {terms, splat} = this.props.params
    var showFocusRelatedContent = [terms, splat].join(' ').match(/related/)

    var { isInspiredByMia } = this.state
    const customImageFn = isInspiredByMia
      ? function(id) {
        const art = this.props.hits.find(({_id}) => id === _id)._source
        const inspired = art['related:inspiredByMia']
        return inspired && inspired[0].image
      }
      : undefined

    console.info('search-results render', {
      isInspiredByMia,
      view: this.state.view.displayName,
      props: this.props,
    })

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
        smallViewport={this.context.smallViewport}
        showRelated={showFocusRelatedContent}
        customImage={customImageFn && customImageFn.bind(this)}
        isInspiredByMia={isInspiredByMia}
      />
    </div>
  },

  focusResult(hit, nextView = false) {
    var {smallViewport} = this.context

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
    var showingAll = hits.length >= search.hits.total || hits.length >= this.maxResults

    const style = {
      marginTop: '1em',
      padding: '1em',
      borderTop: '1em solid #232323',
      minHeight: Math.max(50, this.state.minHeight - postSearchOffset)
    }

    const {searchResults} = this.props.data
    const csvTerms = searchResults.csvQuery
      || [searchResults.query, searchResults.filter].filter(s => s).join(' ')
    const csvUrl = `${SEARCH}/${csvTerms}?format=csv`
    const showCsvLink = true

    return <div ref="postSearch" style={style}>
      <p>
        showing {hits.length} {' '}
        {showingAll || <span>of {search.hits.total} {' '}</span>}
        results matching <code>{search.query}</code>
        {search.filters && <span> and <code>{search.filters}</code></span>}
        {showingAll || showMoreLink}
      </p>

      {showCsvLink && <p>
        <a href={csvUrl}>Download results as CSV</a>
      </p>}
    </div>
  },

  componentDidUpdate(prevProps, prevState) {
    var domNode = this.refs.postSearch && ReactDOM.findDOMNode(this.refs.postSearch)
    var offset = domNode.getBoundingClientRect().top
    if(domNode && offset != prevState.postSearchOffset) {
      this.setState({postSearchOffset: offset || 0})
    }

    if(this.props.query.size == this.state.loadingMore) this.setState({loadingMore: false})

    if(this.props.params.terms !== prevProps.params.terms || this.props.params.splat !== prevProps.params.splat) {
      this.setState({
        isInspiredByMia: this.isInspiredByMia(),
        focusedResult: null,
      })
    }
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
  smallViewport: React.PropTypes.bool,
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
