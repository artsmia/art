var React = require('react')
var Router = require('react-router')
var {Route, Redirect, RouteHandler, DefaultRoute} = Router
var resolveHash = require('when/keys').all

var App = React.createClass({
  render() {
    return (
      <div>
        <header><a href="/"><div className='logo-container'></div></a><div className='wordmark-container'></div></header>
        <RouteHandler {...this.props}/>
      </div>
    )
  }
})

var Home = require('./src/home')
var Search = require('./src/search')
var SearchResults = require('./src/search-results')
var Artwork = require('./src/artwork')
var ArtistsByLetter = require('./src/artists-by-letter')
var ObjectsById = require('./src/objects-by-id')
var Department = require('./src/department')

var routes = (
  <Route handler={App} path="/">
    <DefaultRoute name="home" handler={Home}/>
    <Route name="artwork" path="art/:id" handler={Artwork} />
    <Route name="search" path="/search/" handler={Search}>
      <Route name="searchResults" path=":terms" handler={SearchResults}>
        <Route name="filteredSearchResults" path="filters/*" handler={SearchResults} />
      </Route>
    </Route>
    <Route name="department" path="/departments/:dept" handler={Department} />
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
    const search = data.searchResults || data.filteredSearchResults
    if(search) console.info('search took', search.took, search)
    React.render(<Handler {...state} data={data}/>, document.body)
  })
});

