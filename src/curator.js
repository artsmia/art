var React = require('react')
var Router = require('react-router')
var {Link} = Router
var Helmet = require('react-helmet')

var rest = require('rest')

var Markdown = require('./markdown')
var endpoint = require('./endpoints').info
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
      curator: (params, query) => {
        return rest(endpoint).then((r) => JSON.parse(r.entity))
      }
    },
  },

  render() {
    var curator = this.props.data.curator.curators[this.props.params.slug]
    var departmentLink
    var departmentNames = findDepartment(curator.department)
    if(departmentNames) {
      var [_, _, departmentSlug] = departmentNames
      var departmentLink = <Link to="department" params={{dept: departmentSlug}}>{curator.department}</Link>
    }


  return <div>
    <div className="curator-header"></div>
    <div className="curatorProfile pageText">
      <h2>{curator.name}</h2>
      <h4>{departmentLink || curator.department}</h4>
      <h5><Markdown>{curator.title}</Markdown></h5>
      <div className="curatorContent">
        <div className="curatorPic">
          <img src={`https://collections.artsmia.org/_info/curator-portraits/${curator.slug}.jpg`} alt={`portrait of ${curator.name}`} />
        </div>
        <Markdown alreadyRendered={true}>{curator.output}</Markdown>
      </div>
      {curator.cv && <p><a href={`https://collections.artsmia.org/_info/cv/${curator.cv}`}>Curriculum Vitae</a></p>}
    </div>
  </div>
  }
})

module.exports = Curator
