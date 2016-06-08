var React = require('react')
var Router = require('react-router')
var {Link} = Router

var toSlug = require('speakingurl')
var LazyLoad = require('react-lazy-load')

var SEARCH = require('./endpoints').search
var rest = require('rest')
var Search = require('./search')
var MapPage = require('./map-page')
var Markdown = require('./markdown')

// TODO: de-dupe this and src/home.js
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
          <p>There's more to explore. Use your digital device to visit more.artsmia.org and enjoy additional multimedia content wherever you see this symbol.</p>
          <p>To find more, search for an artwork by title, artist, or "accession number".</p>
          <p><img src="/images/more-icon.svg" style={{maxWidth: '11em'}} /></p>

          <div>
            <h2>Personalize your Mia experience with new ways to explore art.</h2>

            <h3>Journeys</h3>
            <p>Use this new app to create a personalized journey through the museum or follow the suggestions of others. Either way, we’ll map it out for you. <a href="https://itunes.apple.com/us/app/mia-journeys/id1058993004">Download the app free (iOS).</a></p>

            <h3>Overheard</h3>
            <p>Eavesdrop on the conversations of fictional fellow visitors as they wander the galleries, using this playful new audio app. <a href="https://itunes.apple.com/us/app/overheard-mia/id1116319582">Download it free (iOS)</a>.</p>
            <ExpandableNewArtsmiaContentBlock page="/art-tech-award/overheard/" />

            <h3>ArtStories</h3>
            <p>In-depth multimedia explorations of Mia’s highlights and hidden gems—from intriguing details to secret backstories. Available on iPads in the galleries, and optimized for your smartphone or home computer: <a href="http://artstories.artsmia.org">ArtStories</a>.</p>
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

var ExpandableNewArtsmiaContentBlock = React.createClass({
  // statics: {
  //   fetchData: (params, query) => {
  //   }
  // },
  getInitialState() {
    return {
      expanded: false,
      loaded: false,
    }
  },

  componentWillMount() {
    this.loadExternalContent()
  },

  loadExternalContent() {
    return rest('http://new.artsmia.org'+this.props.page+'?json=1')
    .then((r) => JSON.parse(r.entity))
    .then(json => this.setState({loaded: true, json: json}))
  },

  render() {
    var {loaded, expanded, json} = this.state
    var toggleButton = <a href="#" onClick={this.toggle}>{expanded ? 'Less' : 'More'} Info</a>
    var content = loaded && <Markdown>
      {json.page.custom_fields.modules_1_content_0_text[0]}
    </Markdown>

    return <div>
      {toggleButton}
      {loaded && expanded && content}
    </div>
  },

  toggle(event) {
    this.setState({expanded: !this.state.expanded})
    event.preventDefault()
    return false
  },
})

