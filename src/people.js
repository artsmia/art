var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')
var Helmet = require('react-helmet')
var toSlug = require('speakingurl')
var LazyLoad = require('react-lazy-load').default

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')

var People = React.createClass({
  statics: {
    fetchData: {
      artists: (params, query) => {
        return rest(`http://localhost:4680/people/index`)
        .then((r) => {
          const json = JSON.parse(r.entity)
          console.info('artists People', params, json)
          window.artists = json
          return json
        })
      }
    }
  },

  componentDidMount() {
    this.props.toggleAppHeader()
  },

  render() {
    var {artists} = this.props.data

    return <section>
      {artists.map(artist => {
        return <li style={{minHeight: 100}}>
          <Link to='artist' params={{id: artist.ConstituentID || 443}}>
            {artist.DisplayName}
          </Link>

          <LazyLoad style={{minHeight: 200}}>
            <Peek
              facet="artist"
              q={artist.DisplayName}
              quiltProps={{maxRowHeight: 300}}
              showSingleResult={true}
            />
          </LazyLoad>
        </li>
      })}

      <Helmet title={`All Artists at Mia`} />
    </section>
  },
})

module.exports = People

