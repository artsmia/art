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
      searchResults: (params) => rest(`${SEARCH}/ids/${params.ids}`)
      .then((r) => JSON.parse(r.entity))
      .then(json => {
        // remove any ids that weren't found in ES
        const existingHits =  json.hits.hits.filter(hit => {
          const hasData = hit && hit.found
          if(!hasData) console.error('no data for', hit)
          return hasData
        })

        // and reshape the ES payload to look the same, but exclude them
        return {
          ...json,
          hits: {
            ...json.hits,
            total: existingHits ? existingHits.length : 0,
            hits: existingHits,
          }
        }
      }),
    },
  },

  render() {
    return <Search {...this.props} />
  }
})

module.exports = ObjectsById
