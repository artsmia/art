var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')
var {Link} = Router

var Markdown = require('./markdown')
var rest = require('rest')
var endpoint = require('./endpoints').info


var Curators = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: {
      curators: (params, query) => {
        return rest(endpoint).then((r) => JSON.parse(r.entity))
      }
    },
    willTransitionTo: function (transition, params, query, callback) {
      return transition.redirect('home', {status: 301})
    },
  },

  render() {
    var curators = this.props.data.curators.curators

    return <div>
    <div className="explore-header"></div>
    <div className="mdl-grid curatorsPage" id="curators">
      <h2>Curators</h2>
      {Object.keys(curators)
      .filter(name => ['kaywin-feldman', 'matthew-welch', 'yasufumi-nakamori'].indexOf(name) == -1)
      .map(name => {
        var curator = curators[name]
        if(!curator || !curator.slug) return

        return <div className="mdl-cell curatorBio" key={curator.slug}>
          <Link to="curator" params={{slug:curator.slug}}>
            <div className="curatorPic">
              <img src={`https://collections.artsmia.org/_info/curator-portraits/${curator.slug}.jpg`} alt={`portrait of ${curator.name}`} />
            </div>
            <div className="curator-intro">
              <h4>{curator.name}</h4>
              <h5><Markdown>{curator.title}</Markdown></h5>
            </div>
          </Link>
        </div>
      })}
    </div>
    <Helmet title="Curators" />
    </div>
  }
})

module.exports = Curators
