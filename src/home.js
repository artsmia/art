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
            Browse
          </Link>
        </li>
        </ul>
      </div>
      <div className="welcome mdl-grid">
      <h2>Welcome to Mia&#39;s Collection</h2>
      <div className="mdl-cell mdl-cell--9-col">
        <p>Lorem ipsum dolor sit amet, suspendisse justo ultricies erat nulla scelerisque, est class rhoncus. In ac, nibh vitae. Bibendum blandit libero at curabitur porttitor quis, cras dis varius tempor donec in velit. Justo sed risus suspendisse interdum, platea adipiscing sociis libero integer at augue, ac at mattis facilisis pellentesque bibendum, mauris omnis, quis odio amet maecenas. Purus felis nibh velit, nulla aenean sodales hymenaeos nam erat, est scelerisque eget at suscipit ex, nec nibh consectetuer nulla mattis tellus, ullamcorper placerat sed. Dignissim erat ante rutrum vehicula dolor, maecenas purus penatibus velit, quam duis ligula consectetuer bibendum lacinia. Nec augue scelerisque in, lectus eu commodo torquent nunc feugiat, tristique tempor odio, leo etiam.</p>
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
            return <li className="mdl-cell mdl-cell--4-col">
              <Link to="page" key={name} params={{name: toSlug(name)}}>{name}</Link>
            </li>
          })}
        </ul>
    </div>
  </div>
  },
})
