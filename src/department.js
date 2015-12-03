var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')

var rest = require('rest')

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')
var DepartmentDecorator = require('./decorate/department')
var findDepartment = require('./department-slug')

var Department = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: {

      curators: (params, query) => {
        return rest("http://artsmia.github.io/collection-info/index.json").then((r) => JSON.parse(r.entity))
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
        <DepartmentDecorator department={deptName} params={this.props.params} departmentInfo={this.props.data.departments} />
      </div>
      <Peek facet="department" q={deptName} quiltProps={{maxRowHeight: 400}} offset={10}/>
      <Helmet title={deptName} />
    </div>
  }
})

module.exports = Department
