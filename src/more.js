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

  componentDidMount() {
    var {smallViewport} = this.context
    var quiltWrap = document.querySelector('.quilt-wrap') 
    if(quiltWrap && smallViewport && window.scrollX == 0) setTimeout(() => window.scrollTo(0, quiltWrap.clientHeight), 0)
    window.enteredViaMore = true
  },

  render() {
    let {smallViewport} = this.context
    let quiltProps = smallViewport ? 
      {maxRows: 1, maxWorks: 5} :
      {maxRows: 2, maxWorks: 9}

    return <div id="morePage">
      <Search
        hideResults={true}
        activateInput={true}
        quiltProps={quiltProps}
        facet={'highlight:true'}
        searchAll={true}
        suggestStyle={{margin: "1em 3em"}}
        bumpSearchBox={smallViewport}
        shuffleQuilt={true}
        hideHeader={true}
        {...this.props} />

      <div id="more" className="welcome mdl-grid">
        <div className="mdl-cell mdl-cell--9-col">
          <h1>
            Search to explore audio guides, ArtStories, and more
          </h1>
          <img src="/images/more-icon.svg" />
          <p className="labelHelper"><TombstoneIdeograph /></p>

          <hr />
          <p><Link to="explore">More ways to explore the collection</Link></p>
        </div>
      </div>

      {smallViewport || <div id="map">
        <MapPage hideList={true}>
          <Link to="map" style={{textAlign: 'center', float: 'right', paddingRight: '1em'}}>
            All galleries
          </Link>
        </MapPage>
      </div>}
    </div>
  },
})
More.contextTypes = {
  smallViewport: React.PropTypes.bool,
}

module.exports = More

var tombstoneStyles = {
  position: 'absolute',
  background: 'white',
  zIndex: 1000,
  width: '90vw',
  padding: '1em',
  border: '1px solid black',
  marginTop: '1em',
}


var RandomArtworkTombstone = require('./random-artwork-tombstone')
var TombstoneTooltip = React.createClass({
  render() {
    var {expanded, timeClicked} = this.state

    var fieldToHighlight = this.props.children

    return <span style={{display: 'inline', cursor: 'pointer'}}
      onMouseOver={this.toggleExpanded.bind(this, true)}
      onMouseOut={this.toggleExpanded.bind(this, false)}
      onClick={this.toggleExpanded}>
      <a onclick="return false">{this.props.children}</a>
      {expanded && <div style={tombstoneStyles}>
        <RandomArtworkTombstone fieldToHighlight={fieldToHighlight} />
      </div>}
    </span>
  },

  getInitialState() {
    return {
      expanded: this.props.startOpen,
    }
  },

  toggleExpanded(value) {
    this.setState({
      expanded: value || !this.state.expanded,
    })
  },
})

// http://stackoverflow.com/a/23619085
function intersperse(arr, sep) {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce(function(xs, x, i) {
    return xs.concat([sep, x]);
  }, [arr[0]]);
}

var TombstoneIdeograph = React.createClass({
  getInitialState() {
    return {fieldToHighlight: 'accession number'}
  },

  render() {
    var {fieldToHighlight} = this.state
    var fieldHighlighters = ['title', 'artist', 'accession number'].map(fieldName => {
      return <a key={fieldName} onclick="return false" onClick={this.changeHighlight.bind(this, fieldName)}>{fieldName}</a>
    })
    return <div>
      <p>To find more, search for an artwork by <span>{intersperse(fieldHighlighters, ', ')}</span>.</p>
      <RandomArtworkTombstone initialId="529" fieldToHighlight={fieldToHighlight} />
    </div>
  },

  changeHighlight(field) {
    this.setState({fieldToHighlight: field})
  },
})
