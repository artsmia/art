var React = require('react')
var Router = require('react-router')
var {Route, Redirect, RouteHandler, DefaultRoute, Link} = Router
var Helmet = require('react-helmet')

var Home = require('./src/home')
var Search = require('./src/search')
var SearchResults = require('./src/search-results')
var Artwork = require('./src/artwork')
var ArtistsByLetter = require('./src/artists-by-letter')
var ObjectsById = require('./src/objects-by-id')
var Department = require('./src/department')
var Browse = require('./src/browse')

var App = React.createClass({
  render() {
    return (
      <div>
        <header><Link to="home"><div className='logo-container'></div></Link></header>
        <Helmet
          title="Art!"
          titleTemplate="%s ˆ Mia"
          />
        <RouteHandler {...this.props}/>
      </div>
    )
  },

  getChildContext() {
    return {
      universal: this.props.universal,
    }
  },
})
App.childContextTypes = {universal: React.PropTypes.bool}

var routes = (
  <Route handler={App} path="/">
    <DefaultRoute name="home" handler={Home}/>
    <Route name="artwork" path="art/:id" handler={Artwork} />
    <Route name="artworkSlug" path="art/:id/:slug" handler={Artwork} />
    <Route name="search" path="/search/" handler={Search}>
      <Route name="searchResults" path=":terms" handler={SearchResults}>
        <Route name="filteredSearchResults" path="filters/*" handler={SearchResults} />
      </Route>
    </Route>
    <Route name="department" path="/departments/:dept" handler={Department} />
    <Route name="browse" path="/browse" handler={Browse} />
    <Route name="artistsByName" path="/search/artists/:letter" handler={ArtistsByLetter} />
    <Route name="objectsById" path="/search/ids/:ids" handler={ObjectsById} />
  </Route>
);

module.exports = routes
