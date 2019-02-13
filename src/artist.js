var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')
var Helmet = require('react-helmet')
var toSlug = require('speakingurl')
var R = require('ramda')

var Search = require('./search')
var SearchResults = require('./search-results')
var Peek = require('./peek')
var searchEndpoint = require('./endpoints').search

var Person = React.createClass({
  statics: {
    fetchData: {
      artist: (params, existingData) => {
        return rest(`${searchEndpoint}/people/${params.id}`)
          .then(({entity}) => JSON.parse(entity))
      },
      searchResults: (params, query) => {
        return false
        return rest(`${searchEndpoint}/people/${params.id}`)
          .then(({entity}) => JSON.parse(entity))
          .then(artist => {
            params.terms = `artist:"${artist.name}"`
            return SearchResults.fetchData.searchResults(params, query)
          })
      },
    },

    willTransitionTo: function (transition, params, query, callback) {
      rest(`${searchEndpoint}/people/${params.id}`)
        .then(({entity}) => JSON.parse(entity))
        .then(artist => {
          var artistSlug = toSlug(artist.name)

          if(artistSlug !== params.slug || artist.id !== Number(params.id)) {
            params.slug = artistSlug
            params.id = artist.id
            transition.redirect('artistSlug', params)
          }
          return callback()
        })
    }
  },

  render() {
    var {artist, searchResults} = this.props.data
    var {thumbnail, link, extract} = artist.wikipedia || {}
    var {artistDescription} = artist.wikidata || {}

    return <div>
      {!this.props.hideHeader && <div style={{background: '#232323', height: '7em', width: '100%'}} />}
      {false && <Search
        facet={`artist:"${artist.name}"`}
        {...this.props}
        quiltProps={{darken: true}}
        hideInput={true}
        hideResults={true} />}

      <div className="personPage" style={{padding: '1em', maxWidth: '47em', margin: '0 auto'}}>
        {thumbnail && <img src={thumbnail} style={{float: 'right', margin: '0 0 1em 1em'}} alt={`image of ${artist.name} from wikipedia`}/>}
        <h2>{artist.name}</h2>
        {extract && <p>
          {extract}
          {' '}<a href={link}>Read more from Wikipedia &rarr;</a>
        </p>}
        {!extract && artistDescription && <p>
          {artistDescription}
          {' '}<a href={`https://tools.wmflabs.org/reasonator/?&q=${artist.q}`}>See more from wikidata &rarr;</a>
        </p>}

        {artist.wikidata && <OtherMuseumsArtistPages artist={artist} />}
      </div>

      <hr style={{visibility: 'hidden', clear: 'both'}} />
      <Peek facet="artist" q={artist.name} quiltProps={{maxRowHeight: 100}} showSingleResult={true} style={{position: 'absolute', bottom: 0, width: '100vw'}} />
      <Helmet title={artist.name} />
    </div>
  },
})

module.exports = Person

const OtherMuseumsArtistPages = ({artist}) => {
  /**
   * map datapoints returned from wikidata indicating constituent IDs at other museums
   * to an array of shape `[museum name, link to artist page]`
   */
  const museumMap = {
    aicID: (id) => ['the Art Institute of Chicago', `https://www.artic.edu/artists/${id}`],
    saamID: (id) => ['the Smithsonian American Art Museum', `http://americanart.si.edu/collections/search/artist/?id=${id}`],
    momaID: (id) => ['the Museum of Modern Art in New York', `https://www.moma.org/artists/${id}`],
  }
  const others = R.values(R.evolve(museumMap, R.pick(R.keys(museumMap), artist && artist.wikidata)))

  return others.length === 0 ? <span /> : <div style={{marginTop: '1em'}}>
    <p>
      Works by this artist in other museums: {' '}
      {others.map(([orgName, link], index) => <span key={orgName}><a href={link}>{orgName}</a>{index == others.length-1 ? '.' : ', '}</span>)}
    </p>
  </div>
}
