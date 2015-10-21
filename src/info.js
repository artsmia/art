var React = require('react')
var Router = require('react-router')
var {Link} = Router
var Helmet = require('react-helmet')
var rest = require('rest')
var toSlug = require('speakingurl')

var Info = React.createClass({
  statics: {
    fetchData: {
      pages: (params, query) => rest("http://artsmia.github.io/collection-info/index.json")
        .then(r => JSON.parse(r.entity).pages)
    }
  },

  render() {
    var pages = Object.keys(this.props.data.pages)
    .filter(key => !key.match('index'))
    .map(name => this.props.data.pages[name])

    return <ul>{pages.map(page => {
      return <li><Link to="page" params={{name: toSlug(page.title)}}>{page.title}</Link></li>
    })}</ul>
  },
})

module.exports = Info
