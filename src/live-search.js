var React = require('react')

var Search = require('./search')
var SearchResults = require('./search-results')

var styles = {
  searchBox: {
    position: 'absolute',
    top: '3em',
    left: 0,
    right: 0,
    minHeight: '3em',
    zIndex: '1000',
    backgroundColor: 'white',
    borderBottom: '1em solid #222',
    background: '#222',
    color: 'white',
  },

  message: {
    textAlign: 'center',
    display: 'inline-block',
    width: '100%',
    paddingTop: '1em',
  },
}

var LiveSearch = React.createClass({
  render() {
    return <div style={styles.searchBox}>
      <Search
        hideResults={true}
        blank={this.state.blank}
        activateInput={true}
        onUpdate={this.updateQuilt}
        onSearch={this.afterSearch}
        terms={this.state.terms}
        results={this.state.results}
        link={['searchResults', {terms: this.state.terms}]}
        >
        <span style={styles.message}>{this.getText()}</span>
      </Search>
    </div>
  },

  updateQuilt(terms) {
    !!terms &&
      SearchResults.fetchData.searchResults({terms})
      .then(results => this.setState({results, blank: false, terms}))
  },

  afterSearch(terms) {
    this.props.afterSearch({forceClose: true})
  },

  getInitialState() {
    return {
      results: [],
      blank: true
    }
  },

  getText() {
    var {results} = this.state
    return results.hits &&
      `(${Math.min(results.hits.total, 10)} of ${results.hits.total}
      results for '${this.state.terms}'.
      hit enter to see the rest)`
  },
})

module.exports = LiveSearch
