var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')

var rest = require('rest')

var Search = require('./search')
var SearchResults = require('./search-results')
var GalleryDecorator = require('./decorate/gallery.js')
var Markdown = require('./markdown')
var Peek = require('./peek')
var {galleries, messages} = require('../data/galleries.json')
var galleryPanelUrl = require('./endpoints').galleryPanel

var Gallery = React.createClass({
  mixins: [Router.State, Router.Navigation],

  statics: {
    fetchData: {
      gallery: (params, query) => {
        var id = params.gallery.replace(/g/i, '')
        var url = galleryPanelUrl(id)
        return rest(url).then(result => {
          return result.status.code == 200 ? result.entity : false
        })
      },
      searchResults: (params, query) => {
        if(!params.gallery.match(/^g/i)) params.gallery = `G${params.gallery}`
        params.terms = '*'
        params.splat = 'room:"'+params.gallery+'"'
        return SearchResults.fetchData.searchResults(params, query)
      },
    },

    willTransitionTo: function (transition, params, query, callback) {
      var {gallery} = params

      var isWithinTargetGalleries = gallery !== '266-G274' &&
        266 <= parseInt(gallery)
        && parseInt(gallery) <= 274

      if(isWithinTargetGalleries) {
        transition.redirect('gallery', {...params, gallery: '266-G274'})
      }

      callback()
    },
  },

  render() {
    var {gallery} = this.props.params
    var facet = `room:"${gallery}"`
    var galleryPanel = this.props.data.gallery
    var number = gallery.replace(/g/i, '')
    if(number == '266-274') number = '266-G274'
    var galleryInfo = galleries[number]
    var galleryTitle = galleryPanel ?
      galleryPanel.replace(/^# /, '').split('\n')[0] :
      galleryInfo.title
    var pageTitle = `${gallery}: ${galleryTitle || 'On view now'}`

    return <div>
      <Search
        facet={facet}
        {...this.props}
        summaryProps={{
          galleryPanel: galleryPanel,
          showFullGalleryInfo: true,
          // changeTo: this.changeGallery,
        }}
        disableHover={true} // TODO: fix :hover going to the search results page
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
})

module.exports = Gallery
