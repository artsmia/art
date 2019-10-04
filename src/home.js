var React = require('react')
var Router = require('react-router')
var {Link} = Router

var toSlug = require('speakingurl')

var SEARCH = require('./endpoints').search
var rest = require('rest')
var Search = require('./search')
var MapPage = require('./map-page')
var Departments = require('./departments').component

var Home = React.createClass({
  statics: {
    fetchData: {
      searchResults: (params, query) => {
        let searchUrl = `${SEARCH}/highlight:true`
        return rest(searchUrl).then((r) => JSON.parse(r.entity))
      }
    },
  },

  render() {
    let {smallViewport} = this.context
    let width = window && window.innerWidth
    let quiltProps = smallViewport ?
      {maxRows: 2, maxWorks: 7} :
      {maxRows: 3, maxWorks: 30}

    if(window && window.ondeviceorientation && width > 500 && width < 800) quiltProps.maxRows = 1

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
      <HomeDepartmentsAndPages />
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
Home.contextTypes = {
  smallViewport: React.PropTypes.bool,
}

module.exports = Home

var HomeDepartmentsAndPages = React.createClass({
  pages: ['Purcell-Cutts House', 'Provenance Research', 'Deaccessions', 'Conservation'],

  render() {
    return <div className="landingPageBody">
      <div className="mdl-grid">
        <ul className="info">
          <li className="mdl-cell mdl-cell--4-col">
            <Link to='searchResults' params={{terms: 'highlight:true'}}>
              Highlights
            </Link>
          </li>
          <li className="mdl-cell mdl-cell--4-col">
            <Link to="/new">
              New to Mia
            </Link>
          </li>
          <li className="mdl-cell mdl-cell--4-col">
            <Link to='explore'>
              Explore
            </Link>
          </li>
        </ul>
      </div>
      <div className="welcome mdl-grid">
      <div className="mdl-cell mdl-cell--9-col">
        <p>It is our mission to enrich the community by collecting, preserving, and making accessible outstanding works of art from the world’s diverse cultures. With over 90,000 artworks, Mia’s collection includes art from six continents, spanning about 5,000 years.  Here you will find world-famous artworks that embody the highest levels of artistic achievement and speak to the enduring power of human creativity to shape our world. </p>
      </div>
      </div>
      <Departments compact={true} />

      <div className="mdl-grid">
        <ul className="info">
          {this.pages.map(name => {
            return <li key={name} className="mdl-cell mdl-cell--3-col">
              <Link to="page" params={{name: toSlug(name)}}>{name}</Link>
            </li>
          })}
        </ul>
      </div>
    </div>
  },
})
