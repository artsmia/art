var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')

var rest = require('rest')

var Markdown = require('./markdown')

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')
var DepartmentDecorator = require('./decorate/department')
var findDepartment = require('./department-slug')

var Curator = React.createClass({
  mixins: [Router.State],
  headers: [
    {curator:'aaron-rio', image:'http://new.artsmia.org/exhibitions'},
    {curator:'andreas-marks', image:'http://new.artsmia.org/exhibitions'},
    {curator:'dennis-michael-jon', image:'http://new.artsmia.org/exhibitions'},
    {curator:'jan-lodewijk-grootaers', image:'http://new.artsmia.org/exhibitions'},
    {curator:'jennifer-komar-olivarez', image:'http://new.artsmia.org/exhibitions'},
    {curator:'jill-ahlberg-yohe', image:'http://new.artsmia.org/exhibitions'},
    {curator:'liu-yang', image:'http://new.artsmia.org/exhibitions'},
    {curator:'nicole-labouff', image:'http://new.artsmia.org/exhibitions'},
    {curator:'patrick-noon', image:'http://new.artsmia.org/exhibitions'},
    {curator:'rachel-mcgarry', image:'http://new.artsmia.org/exhibitions'},
    {curator:'thomas-rassieur', image:'http://new.artsmia.org/exhibitions'},
],
  statics: {
    fetchData: {
      /*searchResults: (params, query) => {
        params.terms = '*'
        var name = findDepartment(params.slug)[0]
        params.splat = 'department:"'+name+'"'
        return SearchResults.fetchData.searchResults(params, query)
      },*/
      curator: (params, query) => {
        return rest("http://artsmia.github.io/collection-info/index.json").then((r) => JSON.parse(r.entity))
      }
    },
  },

  render() {
    var curator = this.props.data.curator.curators[this.props.params.slug]
  return <div>
    <div className="curator-header"></div>
    <div className="curatorProfile pageText">
      <h2>{curator.name}</h2>
      <h4>{curator.department}</h4>
      <h5>{curator.title}</h5>
      <div className="curatorContent">
        <div className="curatorPic">
          <img src={curator.photo} />
        </div>
        <Markdown>{curator.output}</Markdown>
      </div>
    </div>
  </div>
  }
})

module.exports = Curator
