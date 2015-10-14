var React = require('react')
var Helmet = require('react-helmet')

var Peek = require('./peek')
var Department = require('./department')
var Search = require('./search')
var Artwork = require('./artwork')

var Explore = React.createClass({
  statics: {
    searchResults: Department.fetchData.searchResults
  },

  render() {
    return <div style={{padding: '0 40px'}}>
      {this.searches.map((term) => {
        var [facet, ...terms] = term.split(':')
        return <section>
          <h2 style={{fontSize: '1.5em', padding:'10px 0'}}>Explore <span style={{fontFamily: '"MiaGrotesk-Light",sans-serif'}}>{terms[1]}</span></h2>
          <Peek offset={1} facet={facet} q={terms.join(':')} quiltProps={{maxRowHeight: 600}} />
          <hr style={{visibility: 'hidden'}} />
        </section>
      })}
      <Helmet title="Explore the art" />
    </div>
  },

  peekRandomSearchTerms() {
    return this.searches.map((term) => {
      var [facet, ...terms] = term.split(':')
      return <section>
        <Peek facet={facet} q={terms.join(':')} quiltProps={{maxRowHeight: 600}} />
        <hr style={{visibility: 'hidden'}} />
      </section>
    })
  },

  searches: [
    '_exists_:related:artstories',
    '_exists_:related:newsflashes',
    '_exists_:related:audio-stops',
    'artist:Hokumyō',
  ],
})

module.exports = Explore
