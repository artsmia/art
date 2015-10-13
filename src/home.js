var React = require('react')
var Router = require('react-router')
var {Link} = Router

var toSlug = require('speakingurl')

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
    return <div>
      <Search
        hideResults={true}
        activateInput={true}
        quiltProps={{maxRows: 3, maxWorks: 30}}
        facet={'highlight:true'}
        searchAll={true}
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

  pages: ['Purcell-Cutts House', 'Provenance Research', 'Deaccessions'],

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
            New Art<sup>*</sup>
          </Link>
        </li>
        <li className="mdl-cell mdl-cell--4-col">
          <Link to='browse'>
            Explore
          </Link>
        </li>
        </ul>
      </div>
      <div className="welcome mdl-grid">
      <h2>Welcome to Mia&#39;s Collection</h2>
      <div className="mdl-cell mdl-cell--9-col">
        <p>Mia inspires wonder with extraordinary exhibitions and one of the finest wide-ranging art collections in the country. From Monet to Matisse, Asian to African, 40,000-year-old artifacts to world-famous masterpieces, Mia links the past to the present and enables global conversations. Mia inspires wonder with extraordinary exhibitions and one of the finest wide-ranging art collections in the country. From Monet to Matisse, Asian to African, 40,000-year-old artifacts to world-famous masterpieces, Mia links the past to the present and enables global conversations. Mia inspires wonder with extraordinary exhibitions and one of the finest wide-ranging art collections in the country. From Monet to Matisse, Asian to African, 40,000-year-old artifacts to world-famous masterpieces, Mia links the past to the present and enables global conversations.</p>
      </div>
      </div>
      <div className="departmentList mdl-grid">
      <h2>Departments</h2>
        {this.departments.map((dept) => {
          var name = index => findDepartment(dept)[index]
          return <Link to='department' key={name(1)} params={{dept: name(2)}} className="departmentLink mdl-cell mdl-cell--3-col">
            <div className={[name(1), "departmentListItem"].join(' ')}></div>
            <h2>{dept}</h2>
          </Link>
          }
        )}
      </div>

      <div className="mdl-grid">
        <ul className="info">
          {this.pages.map(name => {
            return <li key={name} className="mdl-cell mdl-cell--4-col">
              <Link to="page" params={{name: toSlug(name)}}>{name}</Link>
            </li>
          })}
        </ul>
    </div>
  </div>
  },
})
