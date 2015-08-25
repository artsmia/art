var React = require('react')
var Router = require('react-router')
var {Link} = Router

var SEARCH = require('./search-endpoint')
var rest = require('rest')
var Search = require('./search')
var departmentNamesMap = require('./department-slug')

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
        quiltProps={{maxRows: 3, maxWorks: 30}}
        link={['searchResults', {terms: 'highlight:true'}]}
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

  render() {
    return <div className="landingPageBody">
    <div className="shortcutLinks">
      <Link to='searchResults' params={{terms: 'highlight:true'}} className="mdl-cell--4-col" >
        <div className="shortcutHighlights">
        </div>
          <h2>Highlights</h2>
            <sub>The pride and joy of Mia</sub>
      </Link>
      <div className="mdl-cell--4-col">
        <div className="shortcutAccessions">
        </div>
          <h2>New Art<sup>*</sup></h2>
          <sub>*new to Mia</sub>
      </div>
      <div className="mdl-cell--4-col">
        <div className="shortcutBrowse">
        </div>
          <h2>Browse</h2>
          <sub>Not sure what to search?</sub>
      </div>
    </div>
    <div className="departmentList">
      <h2>Departments</h2>
        {this.departments.map((dept) => {
          return <Link to='department' key={departmentNamesMap[dept]} params={{dept: dept}} className="departmentLink mdl-cell--6-col"><div className={[departmentNamesMap[dept], "departmentListItem"].join(' ')}></div><h2>{dept}</h2></Link>
        })}</div></div>
      },
    })
