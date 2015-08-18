var React = require('react')
var Router = require('react-router')

var Search = require('./search')
var SearchResults = require('./search-results')

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
    return <Search {...this.props} hideResults={true} />
  }
})

module.exports = Department
