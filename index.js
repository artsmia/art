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
        <input type="search" placeholder="search for something" value={this.state.terms} onChange={this.throttledSearch} />
        <SearchResults {...this.props} updateInput={this.updateInput} />
      </div>
    )
  },

  throttledSearch(event) {
    var terms = event.target.value
    this.setState({terms: terms})

    if(this.search) clearTimeout(this.search)
    this.search = setTimeout(() => this.transitionTo('searchResults', {terms: terms}), 200)
  },

  updateInput(terms) {
    this.setState({terms: terms})
  }
})

var SearchResults = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: (params) => {
      return rest(`http://caption-search.dx.artsmia.org/${params.terms}`).then((r) => JSON.parse(r.entity))
    }
  },

  componentDidMount() {
    this.props.updateInput(this.getParams().terms)
  },

  render() {
    var search = this.props.data.searchResults
    var results = search && search.es.hits.hits.map((hit) => {
      var id = hit._source.id.split('/').reverse()[0]
      return <Artwork key={id} id={id} data={{artwork: hit._source}} />
    })

    return (
      <div>
        {results}
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
    return (
      <div>
        <h1>{this.props.data.artwork.title}</h1>
        <h2>{this.props.data.artwork.artist}</h2>
        <img src={`http://api.artsmia.org/images/${this.getParams().id}/small.jpg`} />
      </div>
    )
  }
})

var routes = (
  <Route handler={App} path="/">
    <Route name="artwork" path="art/:id" handler={Artwork} />
    <Redirect from="/" to="search" />
    <Route name="search" path="/search/" handler={Search}>
      <Route name="searchResults" path="/search/:terms" handler={SearchResults} />
    </Route>
  </Route>
);

Router.run(routes, (Handler, state) => {
  window.Handler = Handler
  window.state = state

  var promises = state.routes.filter((route) => {
    return route.handler.fetchData
  }).reduce((promises, route) => {
    promises[route.name] = route.handler.fetchData(state.params)
    return promises
  }, {})

  resolveHash(promises).then(data => {
    console.log('promises', promises, 'resolved to ', data)
    React.render(<Handler data={data}/>, document.body)
  })
});

