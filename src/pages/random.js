var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var rest = require('rest')

var RandomArtwork = require('../random-artwork')
var ArtworkPreview = require('../artwork-preview')
var Artwork = require('../artwork')
var SEARCH = require('../endpoints').search
var ArtworkPageMetadata = require('../artwork/page-metadata')

// module.exports = RandomArtwork(ArtworkPreview, 'image:valid public_access:1')
var RandomArtworkPage = React.createClass({
  mixins: [Router.State, Router.Navigation],
  statics: {
    fetchData: {
      artwork: (params, existingData) => {
        if(false) return Promise.resolve(existingData)

        const q = params.q || existingData.q || 'image:valid%20public_access:1'
        return rest(`${SEARCH}/random/art?q=${q}`)
        .then((r) => JSON.parse(r.entity))
      },
    },
  },

  getInitialState() {
    return { history: [this.props.data.artwork.id] }
  },

  render() {
    const {data, data: {artwork: art}} = this.props
    const reloadButton = <button onClick={this.nextRandom} title="Show the next random artwork">&#x21bb; Next random</button>

    return <div>
      <Artwork
        data={data}
        art={art}
        showLink={true}
        showLinkComponent={reloadButton}
        {...this.props}
      />
      <ArtworkPageMetadata art={art} prependTitle={'Random Artwork: '} />
    </div>
  },

  nextRandom() {
    const {history} = this.state || {}
    const historyParam = history && history.length > 0
      ? `${[...history].reverse().slice(0, 5).join(',')}` // 5 most recently visited random artworks - don't let ?history=… get too long
      : ''
    this.setState({history: history.concat(this.props.data.artwork.id)})
    const query = {
      ...this.getQuery(),
      history: historyParam,
    }

    this.transitionTo(`/art/random`, {}, query)
  },
})

module.exports = RandomArtworkPage



/* TODO
 *
 * [x] pass a search query via the URL through to the random search
 * show a grid of 3-6 random artworks on desktop, single on mobile?
 * add a big 'refresh' button/link/keyboard shortcut
 * allow revisiting previous 'randoms' via `history`
 *
 */
