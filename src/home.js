var React = require('react')
var Router = require('react-router')
var {Link} = Router

var SEARCH = require('./search-endpoint')
var rest = require('rest')
var Search = require('./search')

var Home = React.createClass({
  statics: {
    fetchData: (params, query) => {
      let searchUrl = `${SEARCH}/highlight:true`
      return rest(searchUrl).then((r) => JSON.parse(r.entity))
    }
  },

  render() {
    return <div>
      <Search hideResults={true} {...this.props} />
      <HomeDepartments />
    </div>
  },
})

module.exports = Home

var HomeDepartments = React.createClass({
  departments: [
    "Prints and Drawings",
    "Photography & New Media",
    "Decorative Arts, Textiles & Sculpture",
    "Chinese, South and Southeast Asian Art",
    "Japanese and Korean Art",
    "Art of Africa and the Americas",
    "Paintings",
    "Contemporary Art",
  ],

  render() {
    return <ul>{this.departments.map((dept) => {
      return <li><Link to='department' params={{dept: dept}}>{dept}</Link></li>
    })}</ul>
  },
})
