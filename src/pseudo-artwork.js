/** @format */
var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')
var Helmet = require('react-helmet')
var cx = require('classnames')

var Artwork = require('./artwork')
var transformData = require('./artwork/pseudo-artwork-data-transform')

const SANDBOX_API = `https://new.artsmia.org/wp-json/wp/v2/sandbox/`

/**
 * This route brings in non-TMS artwork data, and presents it as similarly as
 * possible to a regular TMS artwork.
 *
 * Applications: "Inspired By Mia", "Foot in the Door", …???
 * Long term we could present works from other museums…
 */
var PseudoArtwork = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: {
      originalData: (params, existingData) => {
        var dataURI = `${SANDBOX_API}${params.id}`
        if (existingData && existingData.id && existingData.id == params.id)
          return Promise.resolve(existingData)

        return rest(dataURI).then(r => JSON.parse(r.entity))
      },
      artwork: (params, existingArt) => {
        var existingData = window.__DATA__ && window.__DATA__.originalData
        var existingArt = window.__DATA__ && window.__DATA__.artwork

        if (existingArt && existingArt.id && existingArt.id === params.id)
          return Promise.resolve(existingArt)

        return PseudoArtwork.fetchData
          .originalData(params, existingData)
          .then(data => {
            var transformed = transformData(data)
            window.__DATA__ = { originalData: data, artwork: transformed }

            return transformed
          })
      },
    },

    willTransitionTo: function(transition, params, query, callback) {
      var existingArt = window.__DATA__ && window.__DATA__.artwork
      console.info('wTrT', { params, existingArt })

      return PseudoArtwork.fetchData
        .artwork(params, existingArt)
        .then(art => {
          window.__DATA__ = { artwork: art }
          var slug = art && art.pseudoArtwork.slug
          if (slug && params.slug !== slug) {
            params.slug = slug
            console.info('wTrT redirect', { slug, params, art })
            transition.redirect('sandboxArtworkSlug', params)
          }
        })
        .then(callback)
    },
  },

  render() {
    const {
      data,
      data: { originalData, artwork },
    } = this.props

    return <Artwork data={data} id={data.artwork.id} />
  },
})

module.exports = PseudoArtwork
