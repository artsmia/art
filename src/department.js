var React = require('react')
var Router = require('react-router')

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')
var DepartmentDecorator = require('./decorate/department')

var Department = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: (params, query) => {
      params.terms = '*'
      params.splat = 'department:"'+encodeURIComponent(params.dept)+'"'
      return SearchResults.fetchData(params, query)
    },
  },

  render() {
    var deptName = this.props.params.dept
    return <div>
      <Search {...this.props} hideResults={true} />
      <DepartmentDecorator department={deptName} params={this.props.params} />
      <Peek facet="department" q={deptName} />
    </div>
  }
})

module.exports = Department
