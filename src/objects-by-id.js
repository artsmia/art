var React = require('react')
var Router = require('react-router')
var rest = require('rest')

var SEARCH = require('./search-endpoint')
var ArtworkResult = require('./artwork-result')

var ObjectsById = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: (params) => rest(`${SEARCH}/ids/${params.ids}`).then((r) => JSON.parse(r.entity))
  },

  render() {
    var _self = this
    var objects = this.props.data.objectsById.filter((o, index, objs) =>  o)
    objects.forEach(o => o.id = o.id.replace('http://api.artsmia.org/objects/', ''))
    return (
      <div>
        {objects.map((o) => <ArtworkResult key={'object:'+o.id} id={o.id} data={{artwork: o}} />)}
      </div>
    )
  }
})

module.exports = ObjectsById
