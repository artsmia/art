var React = require('react')
var Router = require('react-router')

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')

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
    return <div>
      <Search {...this.props} hideResults={true} />
      <Peek facet="department" q={this.props.params.dept} />
    </div>
  }
})

module.exports = Department
