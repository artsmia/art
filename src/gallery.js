var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')

var rest = require('rest')

var Search = require('./search')
var SearchResults = require('./search-results')
var GalleryDecorator = require('./decorate/gallery.js')
var Markdown = require('./markdown')
var Peek = require('./peek')

var Gallery = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: {
      gallery: (params, query) => {
        var id = params.gallery.replace(/g/i, '')
        var url = `https://cdn.rawgit.com/artsmia/mia-gallery-panels/master/${id}.md`
        return rest(url).then(result => result.entity)
      },
      searchResults: (params, query) => {
        if(!params.gallery.match(/g/i)) params.gallery = `G${params.gallery}`
        params.terms = '*'
        params.splat = 'room:"'+params.gallery+'"'
        return SearchResults.fetchData.searchResults(params, query)
      },
      // departments: (params, query) => {
      //   return rest(endpoint).then((r) => JSON.parse(r.entity))
      // }
    },
  },

  render() {
    var {gallery} = this.props.params
    var facet = `room:"${gallery}"`

    return <Search
      facet={facet}
      {...this.props}
      summaryProps={{showFullGalleryInfo: true}}
    />
  },
})

module.exports = Gallery
