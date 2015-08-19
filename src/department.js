var React = require('react')
var Router = require('react-router')

var rest = require('rest')

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')
var DepartmentDecorator = require('./decorate/department')

var Department = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: {
      searchResults: (params, query) => {
        params.terms = '*'
        params.splat = 'department:"'+encodeURIComponent(params.dept)+'"'
        return SearchResults.fetchData.searchResults(params, query)
      },
      departments: (params, query) => {
        return rest("http://artsmia.github.io/collection-info/index.json").then((r) => JSON.parse(r.entity))
      }
    },
  },

  render() {
    var deptName = this.props.params.dept
    return <div>
      <Search {...this.props} hideResults={true} />
      <div className="departmentPage">
        <DepartmentDecorator department={deptName} params={this.props.params} departmentInfo={this.props.data.departments} />
      </div>
      <Peek facet="department" q={deptName} />
    </div>
  }
})

module.exports = Department
