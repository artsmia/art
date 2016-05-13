var React = require('react')
var Router = require('react-router')
var {Link} = Router

var toSlug = require('speakingurl')
var LazyLoad = require('react-lazy-load')

var SEARCH = require('./endpoints').search
var rest = require('rest')
var Search = require('./search')
var MapPage = require('./map-page')

var More = React.createClass({
  statics: {
    fetchData: {
      searchResults: (params, query) => {
        let searchUrl = `${SEARCH}/highlight:true`
        return rest(searchUrl).then((r) => JSON.parse(r.entity))
      }
    }
  },

  render() {
    let smallViewport = window && window.innerWidth < 600
    let quiltProps = smallViewport ?
      {maxRows: 2, maxWorks: 7} :
      {maxRows: 3, maxWorks: 30}

    return <div>
      <Search
        hideResults={true}
        activateInput={true}
        quiltProps={quiltProps}
        facet={'highlight:true'}
        searchAll={true}
        suggestStyle={{margin: "1em 3em"}}
        bumpSearchBox={smallViewport}
        shuffleQuilt={true}
        {...this.props} />

      <div className="welcome mdl-grid">
        <div className="mdl-cell mdl-cell--9-col">
          <p>There's MORE to explore for artworks with this icon. Things like audio, video, details, research, and stories.</p>
          <p>To find more, search for an artwork by title, artist, or "accession number".</p>
          <img src="/images/more-icon.svg" />


          <div>
            <h3>Journeys</h3>
            <p>Use this new app to create a personalized journey through the museum or follow the suggestions of others. Either way, we’ll map it out for you. Download the app free (iOS).</p>

            <h3>Overheard</h3>
            <p>Eavesdrop on the conversations of fictional fellow visitors as they wander the galleries, using this playful new audio app. Download it free (iOS).</p>

            <h3><a href="http://artstories.artsmia.org">ArtStories</a></h3>
            <p>In-depth multimedia explorations of Mia’s highlights and hidden gems—from intriguing details to secret backstories. Available on iPads in the galleries, and optimized for your smartphone or home computer.</p>

            <h3>My Mia</h3>
            <p>Become a Mia member, get a custom digital dashboard. Log in to receive advance museum news, member rewards, discounts on tickets and store purchases, and opportunities to support art in our community. (Coming soon.)</p>
          </div>
        </div>
      </div>

      <div id="map">
        <MapPage hideList={true}>
          <Link to="map" style={{textAlign: 'center', float: 'right', paddingRight: '1em'}}>
            All galleries
          </Link>
        </MapPage>
      </div>
    </div>
  },
})

module.exports = More
