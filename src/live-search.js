var React = require('react')

var Search = require('./search')
var SearchResults = require('./search-results')
var CSSTransitionGroup = React.addons.CSSTransitionGroup


var styles = {
  searchBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: '3em',
    zIndex: '1',
    backgroundColor: 'white',
    borderBottom: '1em solid #222',
    background: 'rgb(35,35,35)',
    color: 'white',
    paddingTop:'3.3em',
    webkitBoxShadow: '0px 6px 18px -4px rgba(35,35,35,.75)',
    mozBoxShadow: '0px 6px 18px -4px rgba(35,35,35,.75)',
    boxShadow: '0px 6px 18px -4px rgba(35,35,35,.75)'
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
    return (
    
    <div style={styles.searchBox}>
    <CSSTransitionGroup transitionName="livesearch" transitionAppear={true} transitionEnterTimeout={2000} transitionLeaveTimeout={500}>
      <Search
        hideResults={true}
        blank={this.state.blank}
        activateInput={true}
        onUpdate={this.updateQuilt}
        onSearch={this.afterSearch}
        terms={this.state.terms}
        results={this.state.results}
        link={['searchResults', {terms: this.state.terms}]}
        delay={1000}
        suggestStyle={{margin: "1em 3em"}}
        key="livesearch"
        className="lsearch"
        >
        <span style={styles.message}>{this.getText()}</span>
      </Search>
      </CSSTransitionGroup>
    </div>
    )
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
