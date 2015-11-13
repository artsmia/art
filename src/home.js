var React = require('react')
var Router = require('react-router')
var {Link} = Router

var toSlug = require('speakingurl')
var LazyLoad = require('react-lazy-load')

var SEARCH = require('./search-endpoint')
var rest = require('rest')
var Search = require('./search')
var findDepartment = require('./department-slug')

var Home = React.createClass({
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
    console.info(smallViewport, quiltProps)

    return <div>
      <Search
        hideResults={true}
        activateInput={true}
        quiltProps={quiltProps}
        facet={'highlight:true'}
        searchAll={true}
        suggestStyle={{margin: "1em 3em"}}
        bumpSearchBox={smallViewport}
        {...this.props} />
      <HomeDepartments />
    </div>
  },
})

module.exports = Home

var HomeDepartments = React.createClass({
  departments: [
    "Art of Africa and the Americas",
    "Chinese, South and Southeast Asian Art",
    "Contemporary Art",
    "Decorative Arts, Textiles & Sculpture",
    "Japanese and Korean Art",
    "Paintings",
    "Photography & New Media",
    "Prints and Drawings",
  ],

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
          <Link to="searchResults" params={{terms: 'recent:true'}}>
            New Additions
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
      <h2>Welcome to Mia&#39;s new Collections website</h2>
      <div className="mdl-cell mdl-cell--9-col">
        <p>It is our mission to enrich the community by collecting, preserving, and making accessible outstanding works of art from the world’s diverse cultures. With over 89,000 artworks, Mia’s collection includes art from six continents, spanning nearly 40,000 years.  Here you will find world-famous artworks that embody the highest levels of artistic achievement and speak to the enduring power of human creativity to shape our world. </p>
      </div>
      </div>
      <div className="departmentList mdl-grid">
      <h2>Departments</h2>
        {this.departments.map((dept) => {
          var name = index => findDepartment(dept)[index]
          return <Link to='department' key={name(1)} params={{dept: name(2)}} className="departmentLink mdl-cell mdl-cell--3-col">
            <LazyLoad height="150px"><div className={[name(1), "departmentListItem"].join(' ')}></div></LazyLoad>
            <h2>{dept}</h2>
          </Link>
          }
        )}
      </div>

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
