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
    const results = this.props.data.searchResults
    return {
      terms: this.props.params.terms,
      hits: results && results.es.hits.hits || [],
    }
  },

  render() {
    const results = this.props.data.searchResults
    const hits = results && results.es.hits.hits
    const headerArtworks = hits && hits
      .filter((hit) => hit._source.image == 'valid' && hit._source.image_width > 0)
      .slice(0, 10)
    const showCollage = (headerArtworks && headerArtworks.length > 4)
    const simpleSearchBox = <input type="search" placeholder="search for something" value={this.state.terms} onChange={this.throttledSearch} style={{fontSize: '2em', width: '100%', maxWidth: '11em'}} />
    const searchBox = (
      <div style={showCollage && {position: 'relative', height: '40%', width: '100%', overflow: 'hidden'} || {}}>
        <div style={showCollage && {position: 'absolute', top: '50%', left: 0, right: 0, width: '100%', textAlign: 'center', marginTop: '-1em'} || {}}>
          {simpleSearchBox}
        </div>
        {showCollage && <ImageCollage artworks={headerArtworks} onClick={this.updateFromCollage} />}
      </div>
    )

    return (
      <div>
        {searchBox}
        <SearchResults {...this.props} hits={this.state.hits} />
      </div>
    )
  },

  throttledSearch(event) {
    var terms = event.target.value
    this.setState({terms: terms})

    if(this.search) clearTimeout(this.search)
    this.search = setTimeout(() => this.transitionTo('searchResults', {terms: this.normalizeTerms(terms)}), 200)
  },

  componentWillReceiveProps(nextProps) {
    // Replace `terms` with the terms from the current search, so back+forward
    // work correctly. UNLESS the only difference is insignificant whitespace.
    if(this.normalizeTerms() != nextProps.params.terms) {
      this.setState({terms: nextProps.params.terms})
    }
    this.setState({hits: nextProps.data.searchResults && nextProps.data.searchResults.es.hits.hits || []})
  },

  normalizeTerms(terms=this.state.terms) {
    return terms && terms.replace(/\s+/, ' ').trim()
  },

  // update `state.hits` to float a hit from the collage to the top.
  // If no `art` is passed, that means the collage has lost focus,
  // reset hits to be the searchResults straigt from ES
  updateFromCollage(art) {
    const hits = this.props.data.searchResults.es.hits.hits
    if(art) {
      const index = hits.indexOf(art)+1
      var nextHits = ([art].concat(hits))
      nextHits.splice(index, 1)
    }
    this.setState({hits: nextHits || hits})
  },
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

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits
  },

  render() {
    var search = this.props.data.searchResults
    var hits = search && search.es.hits
    var results = this.props.hits.map((hit) => {
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
      <span>.&nbsp;(<Link to={search.filters ? 'filteredSearchResults' : 'searchResults'}
             params={{terms: search.query, splat: search.filters}}
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
      <div id="aggs" style={{width: '100%', overflowX: 'scroll', whiteSpace: 'nowrap', paddingBottom: '10px'}}>
        {_aggs.map(function(agg) {
          const aggIsActive = search.filters && search.filters.match(new RegExp(agg.name, 'i'))
          const showAgg = agg.buckets.length > 1 || aggIsActive
          if(showAgg) return (<dl key={agg.name} id={agg.name} style={{display: 'inline-block', margin: '0 1em', verticalAlign: 'top'}}>
            <dt style={{fontWeight: aggIsActive && 'bold'}}>{agg.name}</dt>
            {agg.buckets.slice(0, 5).map(function(bucket) { 
              const filterRegex = new RegExp(agg.name+':"'+bucket.key.replace(/([\[\]\?])/, '\\$1')+'"', 'i')
              const bucketIsActive = search.filters && search.filters.match(filterRegex)
              const newFilters = bucketIsActive ? 
                search.filters.replace(filterRegex, '').trim() :
                `${search.filters || ''} ${agg.name.toLowerCase()}:"${encodeURIComponent(bucket.key)}"`.trim()
              const bucketText = `${bucket.key || '""'} - ${bucket.doc_count}`

              if(bucket.key) return (
                <dd key={agg.name+bucket.key} style={{margin: '0 0 0 1em', fontWeight: bucketIsActive && 'bold'}}>
                  {(agg.name == 'Gist' || agg.name == 'On View') ? bucketText : (
                    <Link to={newFilters == '' ? 'searchResults' : 'filteredSearchResults'} params={{terms: `${search.query}`, splat: newFilters}}>
                      {bucketText}
                    </Link>
                  )}
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
    let maxWidth = Math.min(window.innerWidth, 400)
    let height = aspectRatio > 1 ? 400 : aspectRatio*maxWidth
    let width = Math.ceil((1/aspectRatio)*height)
    let padding = width >= maxWidth ? -8 : -8+(maxWidth-width)/2

    return art.image == 'valid' && art.image_width > 0 && (
      <LazyLoad height={height+'px'}>
        <img
          src={`http://api.artsmia.org/images/${id}/400/medium.jpg`}
          style={{maxWidth: maxWidth, margin: window.innerWidth <= 400 && `0 ${padding}`}} />
      </LazyLoad>
    )
  }
})

const ImageCollage = React.createClass({
  getInitialState() {
    return {
      active: null,
      unpinned: false,
    }
  },

  render() {
    const artworks = this.props.artworks

    const imgSize = artworks.length > 5 ?
      { width: '20%', height: '50%', } :
      { width: '50%', height: '50%', }

    const images = artworks.map((art) => {
      const id = art._source.id
      return <span style={{
        background: `url("http://api.artsmia.org/images/${id}/400/medium.jpg") 50% 50% / cover`,
        display: 'inline-block',
        width: imgSize.width,
        height: imgSize.height,
      }}
      key={id}
      onClick={this.clicked.bind(this, art)}
      onMouseEnter={this.hovered.bind(this, art, true)}
      onMouseLeave={this.hovered.bind(this, art, false)}></span>
    })

    return (
      <div onMouseLeave={this.hovered.bind(this, null, false)} style={{cursor: 'pointer'}}>
        {images}
      </div>
    )
  },

  // The imageCollage changes the order of search results in 2 ways:
  // * clicking pins a result to the top, in which case it will stay there
  // * hovering 'floats' a result to the top, but it will sink back down
  // …after the interaction is finished.
  // Clicking the pinned artwork un-pins it
  clicked(art, updateState=true) {
    if(updateState) this.setState({active: art, unpinned: false})
    const sameArt = this.state.unpinned && !updateState ||
      updateState && this.state.active && art == this.state.active
    if(sameArt) {
      this.setState({active: null, unpinned: true})
      art = null
    }
    this.props.onClick(art)
    this.state.unpinned && this.setState({unpinned: false})
  },
  hovered(art, active) {
    // cancel the delayed 'float' on mouseleave
    // if an artwork was clicked, leave it pinned
    if(!active) {
      clearTimeout(this.activate)
      if(!art) this.clicked(this.state.active, false)
      return
    }
    this.activate = setTimeout(this.clicked.bind(this, art, false), 300)
  },
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

  var promises = state.routes.filter((route, index, allRoutes) => {
    // Don't `fetchData` twice for nested routes with the same `Handler`
    // Prefer the parent
    const prevRoute = index > 0 && allRoutes[index-1]
    if(prevRoute && route.handler.fetchData === prevRoute.handler.fetchData) return

    return route.handler.fetchData
  }).reduce((promises, route) => {
    promises[route.name] = route.handler.fetchData(state.params, state.query)
    return promises
  }, {})

  resolveHash(promises).then(data => {
    console.log('promises', promises, 'resolved to ', data)
    React.render(<Handler {...state} data={data}/>, document.body)
  })
});

