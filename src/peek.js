var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')

var SEARCH = require('./search-endpoint')
var ClickToSelect = require('react-click-to-select')
var ImageQuilt = require('./image-quilt')

// TODO: I can't get onClick to work directly on <ClickToSelect>??

var Peek = React.createClass({
  getInitialState() {
    return {
      open: false,
      results: {},
    }
  },

  render() {
    var {results, facetedQ} = this.state
    var result = results && results[facetedQ]

    return <div onClick={this.onClick} testing={123}>
      <ClickToSelect>
        {this.props.children}
      </ClickToSelect>
      {this.state.open && <div className="peek">
        <Link to="searchResults" params={{terms: this.state.facetedQ}}>
          {result && this.quiltFromResults()}
          {result.hits.total} results for {this.state.query} {this.props.facet && `(${this.props.facet})`} &rarr;
        </Link>
      </div>}
    </div>
  },

  onClick() {
    if(this.state.open) return this.setState({open: false})

    var q = React.findDOMNode(this).innerText
    var facetedQ = this.props.facet ? `${this.props.facet}:"${encodeURIComponent(q)}"` : q

    this.setState({
      open: true,
      loading: true,
      query: q,
      facetedQ: facetedQ,
    })
    
    this.state.results[facetedQ] || rest(`${SEARCH}/${facetedQ}?size=10`).then((r) => {
      var results = this.state.results
      results[facetedQ] = JSON.parse(r.entity)
      this.setState({
        results: results,
        loading: false,
      })
    })
  },

  quiltFromResults() {
    var {results, facetedQ} = this.state
    var result = results && results[facetedQ]

    if(!result) return ''
    var wImg = ImageQuilt.getImagedResults(result.hits.hits)
    return <ImageQuilt maxRows={2} maxWorks={10} artworks={wImg} />
  },
})

module.exports = Peek
