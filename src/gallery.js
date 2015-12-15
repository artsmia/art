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
  mixins: [Router.State, Router.Navigation],

  statics: {
    fetchData: {
      gallery: (params, query) => {
        var id = params.gallery.replace(/g/i, '')
        var url = `https://cdn.rawgit.com/artsmia/mia-gallery-panels/master/${id}.md`
        return rest(url).then(result => {
          return result.status.code == 200 ? result.entity : false
        })
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
    var galleryInfo = this.props.data.gallery
    var galleryTitle = galleryInfo && galleryInfo.replace(/^# /, '').split('\n')[0]
    var pageTitle = `${gallery}: ${galleryTitle || 'On view now'}`

    return <div>
      <Search
        facet={facet}
        {...this.props}
        summaryProps={{
          galleryInfo: galleryInfo,
          showFullGalleryInfo: true,
          changeTo: this.changeGallery,
        }}
      />
      <Helmet
        title={pageTitle}
        meta={[
          {property: "og:title", content: pageTitle + ' ^ Minneapolis Institute of Art'},
          {property: "og:description", content: galleryTitle || ''},
        ]}
      />
      </div>
  },

  changeGallery(nextGallery) {
    console.info('changing to', nextGallery)
    this.transitionTo('gallery', {gallery: nextGallery})
  },
})

module.exports = Gallery
