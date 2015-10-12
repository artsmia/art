var React = require('react')
var Helmet = require('react-helmet')

var Peek = require('./peek')
var Department = require('./department')
var Search = require('./search')

var Browse = React.createClass({
  statics: {
    searchResults: Department.fetchData.searchResults
  },

  render() {
    return <div>
      {this.searches.map((term) => {
        var [facet, ...terms] = term.split(':')
        return <section>
          <Peek facet={facet} q={terms.join(':')} quiltProps={{maxRowHeight: 600}} />
          <hr style={{visibility: 'hidden'}} />
        </section>
      })}
      <Helmet title="Browse the art" />
    </div>
  },

  searches: [
    '_exists_:related:artstories',
    '_exists_:related:newsflashes',
    '_exists_:related:audio-stops',
    'artist:Richard Avedon',
  ],
})

module.exports = Browse
