var React = require('react')
var Router = require('react-router')
var rest = require('rest')

var SEARCH = require('./endpoints').search
var ArtworkResult = require('./artwork-result')
var Search = require('./search')

var ObjectsById = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: {
      searchResults: (params) => rest(`${SEARCH}/ids/${params.ids}`).then((r) => JSON.parse(r.entity)),
    },
  },

  render() {
    return <Search {...this.props} />
  }
})

module.exports = ObjectsById
