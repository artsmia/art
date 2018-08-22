var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')

var rest = require('rest')

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')
var DepartmentDecorator = require('./decorate/department')
var findDepartment = require('./department-slug')
var endpoint = require('./endpoints').info
var Departments = require('./departments').component

var Department = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: {
      searchResults: (params, query) => {
        params.terms = '*'
        var name = findDepartment(params.dept)[0]
        params.splat = 'department:"'+name+'"'
        return SearchResults.fetchData.searchResults(params, query)
      },
      departments: (params, query) => {
        return rest(endpoint).then((r) => JSON.parse(r.entity))
      }
    },
  },

  render() {
    var [deptName, _, slug] = findDepartment(this.props.params.dept)
    var facet = `department:"${deptName}"`
    return <div>
      <Search
        facet={facet}
        {...this.props}
        hideInput={true}
        hideResults={true} />
      <div className="departmentPage">
        <DepartmentDecorator key={deptName} department={deptName} params={this.props.params} departmentInfo={this.props.data.departments} />
      </div>
      <Peek facet="department" q={deptName} quiltProps={{maxRowHeight: 400}} offset={10}/>
      <Helmet title={deptName} />
      <Departments compact={true} active={deptName} />
    </div>
  }
})

module.exports = Department
