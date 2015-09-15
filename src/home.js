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
      <div className="shortcutLinks mdl-grid">
        <div className="mdl-cell mdl-cell--4-col">
          <Link to='searchResults' params={{terms: 'highlight:true'}}>
            <div className="shortcutHighlights"></div>
            <h2>Highlights</h2>
            <sub>The pride and joy of Mia</sub>
          </Link>
        </div>
        <div className="mdl-cell mdl-cell--4-col">
          <Link to="searchResults" params={{terms: 'recent:true'}}>
            <div className="shortcutAccessions"></div>
            <h2>New Art<sup>*</sup></h2>
            <sub>*new to Mia</sub>
          </Link>
        </div>
        <div className="mdl-cell mdl-cell--4-col">
          <Link to='browse'>
            <div className="shortcutBrowse"></div>
            <h2>Browse</h2>
            <sub>Not sure what to search?</sub>
          </Link>
        </div>
      </div>

      <div className="departmentList mdl-grid">
      <h2>Departments</h2>
        {this.departments.map((dept) => {
          var name = index => findDepartment(dept)[index]
          return <Link to='department' key={name(1)} params={{dept: name(2)}} className="departmentLink mdl-cell mdl-cell--6-col">
            <div className={[name(1), "departmentListItem"].join(' ')}></div>
            <h2>{dept}</h2>
          </Link>
          }
        )}
      </div>

      <ul className="info">
        {this.pages.map(name => {
          return <li className="mdl-cell mdl-cell--4-col">
            <Link to="page" key={name} params={{name: toSlug(name)}}>{name}</Link>
          </li>
        })}
    </ul>
  </div>
  },
})
