var React = require('react'),
  Router = require('react-router'),
  { NotFoundRoute, Navigation, State, Link, Route, RouteHandler, DefaultRoute, Redirect } = Router,
  resolveHash = require('when/keys').all,
  rest = require('rest')

var App = React.createClass({
  render() {
    return (
      <RouteHandler {...this.props}/>
    )
  }
})

var Search = React.createClass({
  mixins: [Router.State, Router.Navigation],

  getInitialState() {
    return {terms: ''}
  },

  render() {
    return (
      <div>
        <input type="search" placeholder="search for something" value={this.state.terms} onChange={this.throttledSearch} style={{fontSize: '2em', width: '100%', maxWidth: '11em'}} />
        <SearchResults {...this.props} updateInput={this.updateInput} />
      </div>
    )
  },

  throttledSearch(event) {
    var terms = event.target.value
    this.setState({terms: terms})

    if(this.search) clearTimeout(this.search)
    this.search = setTimeout(() => this.transitionTo('searchResults', {terms: terms.trim()}), 200)
  },

  updateInput(terms) {
    this.setState({terms: terms})
  }
})

var SearchResults = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: (params, query) => {
      var size = query.size || 100
      const filters = params.splat
      let searchUrl = `http://caption-search.dx.artsmia.org/${params.terms}?size=${size}`
      if(filters) searchUrl += `&filters=${filters}`
      console.info('searching', searchUrl)
      return rest(searchUrl).then((r) => JSON.parse(r.entity))
    }
  },

  componentDidMount() {
    this.props.updateInput(this.getParams().terms)
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults
  },

  render() {
    var search = this.props.data.searchResults
    var hits = search && search.es.hits
    var results = hits && hits.hits.map((hit) => {
      var id = hit._source.id.replace('http://api.artsmia.org/objects/', '')
      return <div key={id}><Artwork id={id} data={{artwork: hit._source}} highlights={hit.highlight} /><hr/></div>
    })
    if(search && search.es) console.info('search took', search.es.took, search)

    return (
      <div>
        <SearchSummary search={search} hits={hits} results={results} />
        <div style={{clear: 'both'}}>{results}</div>
      </div>
    )
  }
})

const SearchSummary = React.createClass({
  render() {
    const search = this.props.search
    if(!search) return <div />
    const hits = this.props.hits
    const results = this.props.results

    const showAllLink = search && search.es && 
      <span>.&nbsp;(<Link to="searchResults" params={{terms: search.query}}
             query={{size: search.es.hits.total}}>show all</Link>)
      </span>

    return (
      <div>
        <h2>
          showing {hits.hits.length} of {hits.total} results
          matching <code>{search.query}</code> {search.filters && <span>and <code>{search.filters}</code></span>}
          {hits.hits.length < hits.total && {showAllLink}}
        </h2>
        <Aggregations search={search} />
      </div>
    )
  }
})

var Aggregations = React.createClass({
  render() {
    const search = this.props.search
    const aggs = search.es.aggregations
    const _aggs = []
    for(var agg in aggs) {
      var _agg = aggs[agg]
      _agg.name = agg
      _aggs.push(_agg)
    }

    return (
      <div id="aggs">
        {_aggs.map(function(agg) {
          const aggIsActive = search.filters && search.filters.match(new RegExp(agg.name, 'i'))
          const showAgg = agg.buckets.length > 1 || aggIsActive
          if(showAgg) return (<dl key={agg.name} id={agg.name} style={{float: 'left', margin: '0 1em'}}>
            <dt style={{fontWeight: aggIsActive && 'bold'}}>{agg.name}</dt>
            {agg.buckets.slice(0, 5).map(function(bucket) { 
              const filterRegex = new RegExp(agg.name+':"'+bucket.key.replace(/([\[\]\?])/, '\\$1')+'"', 'i')
              const bucketIsActive = search.filters && search.filters.match(filterRegex)
              const newFilters = bucketIsActive ? 
                search.filters.replace(filterRegex, '').trim() :
                `${search.filters || ''} ${agg.name.toLowerCase()}:"${encodeURIComponent(bucket.key)}"`.trim()

              if(bucket.key) return (
                <dd key={agg.name+bucket.key} style={{margin: '0 0 0 1em', fontWeight: bucketIsActive && 'bold'}}>
                  <Link to={newFilters == '' ? 'searchResults' : 'filteredSearchResults'} params={{terms: `${search.query}`, splat: newFilters}}>
                    {bucket.key || '""'} - {bucket.doc_count}
                  </Link>
                </dd>
              )
            })}
          </dl>)
        })}
      </div>
    )
  }
})

var ArtistsByLetter = React.createClass({
  mixins: [Router.State, Router.Navigation],

  statics: { 
    fetchData: (params) => {
      return rest('http://cdn.dx.artsmia.org/artists.json').then((r) => {
        return JSON.parse(r.entity).aggregations.artist.buckets
      })
    }
  },

  render() {
    if(!this.props.data.artistsByName) return <div className="loading"></div>
    var letter = this.getParams().letter
    var letters = this.props.data.artistsByName.map((a) => a)
    console.info(letters)
    return (
      <dl>
      {letters.map((l) => {
        return <div>
          <dt key={l.key}><Link to="artistsByName" params={{letter: l.key}}>{l.key}</Link></dt>
          {letter === l.key && <dd style={{position: 'absolute', top: '3em'}}>
            {l.byName.buckets.map((b) => <Link to="filteredSearchResults" params={{terms: '*', splat: `artist.raw:%22${b.key}%22`}} style={{display: 'block'}}>{b.key}</Link>)}
          </dd>}
        </div>
      })}
      </dl>
    )
  }
})

var ObjectsById = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: (params) => rest(`http://caption-search.dx.artsmia.org/ids/${params.ids}`).then((r) => JSON.parse(r.entity))
  },

  render() {
    var _self = this
    var objects = this.props.data.objectsById.filter((o, index, objs) =>  o)
    objects.forEach(o => o.id = o.id.replace('http://api.artsmia.org/objects/', ''))
    return (
      <div>
        {objects.map((o) => <Artwork key={'object:'+o.id} id={o.id} data={{artwork: o}} />)}
      </div>
    )
  }
})

var Artwork = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: (params) => {
      return rest('http://caption-search.dx.artsmia.org/id/'+params.id).then((r) => JSON.parse(r.entity))
    }
  },
  render() {
    var art = this.props.data.artwork
    var id = this.props.id || art.id.replace('http://api.artsmia.org/objects/', '')
    const highlights = this.props.highlights
    return (
      <div>
        <h1><span dangerouslySetInnerHTML={{__html: highlights && highlights.title || art.title}}></span> ({id}, <a href={`https://collections.artsmia.org/index.php?page=detail&id=${id}`}>#</a>) <Link to="artwork" params={{id: id}}>&rarr;</Link></h1>
        <h2><span dangerouslySetInnerHTML={{__html: highlights && highlights.artist || art.artist}}></span></h2>
        <ArtworkImage art={art} id={id} />
        <p>{art.room === 'Not on View' ? art.room : <strong>{art.room}</strong>}</p>
      </div>
    )
  }
})

let LazyLoad = require('react-lazy-load')
var ArtworkImage = React.createClass({
  render() {
    let art = this.props.art
    let id = this.props.id
    let aspectRatio = art.image_height/art.image_width
    let height = aspectRatio > 1 ? 400 : aspectRatio*400

    return art.image == 'valid' && art.image_width > 0 && (
      <LazyLoad height={height+'px'}>
        <img src={`http://api.artsmia.org/images/${id}/400/medium.jpg`} />
      </LazyLoad>
    )
  }
})

var routes = (
  <Route handler={App} path="/">
    <Route name="artwork" path="art/:id" handler={Artwork} />
    <Redirect from="/" to="search" />
    <Route name="search" path="/search/" handler={Search}>
      <Route name="searchResults" path=":terms" handler={SearchResults}>
        <Route name="filteredSearchResults" path="filters/*" handler={SearchResults} />
      </Route>
    </Route>
    <Route name="artistsByName" path="/search/artists/:letter" handler={ArtistsByLetter} />
    <Route name="objectsById" path="/search/ids/:ids" handler={ObjectsById} />
  </Route>
);

Router.run(routes, (Handler, state) => {
  window.Handler = Handler
  window.state = state

  var promises = state.routes.filter((route) => {
    return route.handler.fetchData
  }).reduce((promises, route) => {
    promises[route.name] = route.handler.fetchData(state.params, state.query)
    return promises
  }, {})

  resolveHash(promises).then(data => {
    console.log('promises', promises, 'resolved to ', data)
    React.render(<Handler data={data}/>, document.body)
  })
});

