var React = require('react')
var Router = require('react-router')
var rest = require('rest')

var SearchSummary = require('./search-summary')
var ArtworkResult = require('./artwork-result')
var SEARCH = require('./search-endpoint')

var SearchResults = React.createClass({
  mixins: [Router.State],

  statics: {
    fetchData: (params, query) => {
      var size = query.size || 100
      const filters = params.splat
      let searchUrl = `${SEARCH}/${params.terms}?size=${size}`
      if(filters) searchUrl += `&filters=${filters}`
      return rest(searchUrl).then((r) => JSON.parse(r.entity))
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits
  },

  render() {
    var search = this.props.data.searchResults
    var results = this.props.hits.map((hit) => {
      var id = hit._source.id.replace('http://api.artsmia.org/objects/', '')
      return <div key={id}><ArtworkResult id={id} data={{artwork: hit._source}} highlights={hit.highlight} /></div>
    })

    return (
      <div className='search-results-wrap clearfix'>
        <SearchSummary search={search} hits={this.props.hits} results={results} />
        <div className='objects-wrap' style={{clear: 'both'}}>{results}</div>
        <div className='objects-focus'>
            <h2>The Death of Germanicus, <span className='date'>1627</span></h2>
            <h5>Nicholas Poussin</h5>
            <img src="http://placehold.it/800x800" />
            <div className='tombstone'>
                Oil on canvas<br />
                58 1/4 x 78 in. (147.96 x 198.12 cm) (canvas)<br/>
                The William Hood Dunwoody Fund 58.28
            </div>
            <p>The young Roman general Germanicus has just been poisoned by his jealous adoptive father, the emperor Tiberius. On his deathbed, Germanicus asks his friends to avenge his murder and his wife to endure her sorrow bravely. The subject of this, Poussin's first major history painting, comes from the Annales of the Roman historian Tacitus. The event occurred in 19 CE. A key work in Western painting, this tragic picture presents a moral lesson in stoic heroism, seen especially in the restraint and dignity of the mourning soldiers. This painting became the model for countless deathbed scenes for two centuries to come, particularly for Neoclassical art around 1800. Many powerful human themes figure here: death, suffering, injustice, grief, loyalty, and revenge. Poussin drew on Roman antiquity for the form as well as the subject of this painting. The composition, with its shallow spatial arrangement, is based on a Roman sarcophagus relief. Poussin spent most of his life in Rome, where he created a classical style that strongly influenced both French and Italian art.</p>
        </div>
      </div>
    )
  }
})

module.exports = SearchResults
