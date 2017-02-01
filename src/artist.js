var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')
var Helmet = require('react-helmet')
var toSlug = require('speakingurl')

var artists = require('../artists.json')

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')

var Person = React.createClass({
  statics: {
    fetchData: {
      artist: (params, query) => {
        // TODO: rest() this?
        return artists.find(a => a.id == Number(params.id))
      },
      searchResults: (params, query) => {
        var artist = artists.find(a => a.id == Number(params.id))
        params.terms = `artist:"${artist.name}"`
        return SearchResults.fetchData.searchResults(params, query)
      },
    },

    willTransitionTo: function (transition, params, query, callback) {
      var artist = artists.find(a => a.id == Number(params.id))
      var artistSlug = toSlug(artist.name)

      if(artistSlug !== params.slug) {
        params.slug = artistSlug
        transition.redirect('artistSlug', params)
      }
      callback()
    }
  },

  render() {
    var {artist, searchResults} = this.props.data

    return <div>
      <Search
        facet={`artist:"${artist.name}"`}
        {...this.props}
        hideInput={true}
        hideResults={true} />

      <div className="personPage">
        <p>{artist.name} created {searchResults.hits.total} works that are now at Mia.</p>
        <pre><code>{JSON.stringify(artist, null, 2)}</code></pre>
      </div>

      <Peek facet="artist" q={artist.name} quiltProps={{maxRowHeight: 400}} offset={10}/>
      <Helmet title={artist.name} />
    </div>
  },
})

module.exports = Person
