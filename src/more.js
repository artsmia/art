var React = require('react')
var Router = require('react-router')
var {Link} = Router

var toSlug = require('speakingurl')
var LazyLoad = require('react-lazy-load').default

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
      {maxRows: 1, maxWorks: 5} :
      {maxRows: 2, maxWorks: 9}

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

      <div id="more" className="welcome mdl-grid">
        <div className="mdl-cell mdl-cell--9-col">
          <p>
            {smallViewport && <img src="/images/more-icon.svg" style={{maxWidth: '7em', padding: '2em 1em 0.25em 1em', float: 'right'}} />}
            There's more to explore. Use your digital device to visit more.artsmia.org and enjoy additional multimedia content wherever you see this symbol.
          </p>
          <p class="labelHelper" style={{position: 'relative'}}>To find more, search for an artwork by <TombstoneTooltip>title</TombstoneTooltip>, <TombstoneTooltip>artist</TombstoneTooltip>, or <TombstoneTooltip>accession number</TombstoneTooltip>.</p>
          {smallViewport || <p><img src="/images/more-icon.svg" style={{maxWidth: '11em'}} /></p>}

          <div>
            <h2>Personalize your Mia experience with new ways to explore art.</h2>

            <h3>Journeys</h3>
            <p>Use this new app to create a personalized journey through the museum or follow the suggestions of others. Either way, we’ll map it out for you. <a href="https://itunes.apple.com/us/app/mia-journeys/id1058993004">Download the app free (iOS).</a></p>
            <ExpandableNewArtsmiaContentBlock page="journeys" />

            <h3>Overheard</h3>
            <p>Eavesdrop on the conversations of fictional fellow visitors as they wander the galleries, using this playful new audio app. <a href="https://itunes.apple.com/us/app/overheard-mia/id1116319582">Download it free (iOS)</a>.</p>
            <ExpandableNewArtsmiaContentBlock page="overheard" />

            <h3>ArtStories</h3>
            <p>In-depth multimedia explorations of Mia’s highlights and hidden gems—from intriguing details to secret backstories. Available on iPads in the galleries, and optimized for your smartphone or home computer: <a href="https://artstories.artsmia.org">ArtStories</a>.</p>
            <ExpandableNewArtsmiaContentBlock page="artstories" />
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
    return rest('https://new.artsmia.org/wp-json/wp/v2/pages?slug='+this.props.page)
    .then((r) => JSON.parse(r.entity))
    .then(json => this.setState({loaded: true, json: json}))
  },

  render() {
    var {loaded, expanded, json} = this.state
    var toggleButton = <a href="#" onClick={this.toggle}>{expanded ? 'Less' : 'More'} Info</a>

    var content = loaded && <div><Markdown>
      {json[0].acf.modules[1].content[0].text}
    </Markdown><hr /></div>

    return <div>
      <p>{toggleButton}</p>
      {loaded && expanded && content}
    </div>
  },

  toggle(event) {
    this.setState({expanded: !this.state.expanded})
    event.preventDefault()
    return false
  },
})

var RandomArtworkTombstone = require('./random-artwork-tombstone')
var TombstoneTooltip = React.createClass({
  render() {
    var {expanded, timeClicked} = this.state

    var styles = {
      position: 'absolute',
      background: 'white',
      zIndex: 1000,
      width: '90vw',
      padding: '1em',
      border: '1px solid black',
      marginTop: '1em',
    }

    var fieldToHighlight = this.props.children

    return <span style={{display: 'inline', cursor: 'pointer'}}
      onMouseOver={this.toggleExpanded.bind(this, true)}
      onMouseOut={this.toggleExpanded.bind(this, false)}
      onClick={this.toggleExpanded}>
      <a onclick="return false">{this.props.children}</a>
      {expanded && <div style={styles}>
        <RandomArtworkTombstone fieldToHighlight={fieldToHighlight} />
      </div>}
    </span>
  },

  getInitialState() {
    return {
      expanded: false,
    }
  },

  toggleExpanded(value) {
    this.setState({
      expanded: value || !this.state.expanded,
    })
  },
})
