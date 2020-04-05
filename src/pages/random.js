var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var rest = require('rest')

var RandomArtwork = require('../random-artwork')
var ArtworkPreview = require('../artwork-preview')
var Artwork = require('../artwork')
var SEARCH = require('../endpoints').search

// module.exports = RandomArtwork(ArtworkPreview, 'image:valid public_access:1')
var RandomArtworkPage = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: {
      artwork: (params, existingData) => {
        if(false) return Promise.resolve(existingData)

        const q = params.q || existingData.q || 'image:valid%20public_access:1'
        return rest(`${SEARCH}/random/art?q=${q}`)
        .then(r => {console.info('random fetch', r); return r;})
        .then((r) => JSON.parse(r.entity))
      },
    },
  },

  render() {
    const reloadButton = <button onClick={() => window.location.reload()} title="Show the next random artwork">&#x21bb; Show another</button>

    return <Artwork
      data={this.props.data}
      art={this.props.data.artwork}
      showLink={true}
      showLinkComponent={reloadButton}
    />
  },
})

module.exports = RandomArtworkPage



/* TODO
 *
 * pass a search query via the URL through to the random search
 * choose between redirecting to the artwork page or staying on `/art/random`
 * show a grid of 3-6 random artworks on desktop, single on mobile?
 * add a big 'refresh' button/link/keyboard shortcut
 */
