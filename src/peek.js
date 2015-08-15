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
      open: !!this.props.q,
      results: {},
    }
  },

  render() {
    var {results, facetedQ} = this.state
    var {child} = this.props
    var result = results && results[facetedQ]

    return <div onClick={this.onClick}>
      {this.props.children && <ClickToSelect>
        {this.props.children}
      </ClickToSelect>}
      {this.state.open && result && <div className="peek" style={{fontSize: '73%', maxWidth: this.state.maxWidth || "100%"}}>
        <Link to="searchResults" params={{terms: this.state.facetedQ}}>
          {result && this.quiltFromResults()}
          {result.hits && result.hits.total} results for {this.state.query} {this.props.facet && `(${this.props.facet})`} &rarr;
        </Link>
      </div>}
      {this.state.open && this.getQs().map((q) => <Peek facet={this.props.facet} q={q} key={q} />)}
    </div>
  },

  onClick() {
    if(this.state.open) return this.setState({open: false})
    console.info('peek q & qs', this.getText(), this.getQs())

    this.setState({
      open: true,
      loading: true,
    })

    this.fetchResults()
  },

  quiltFromResults() {
    var {results, facetedQ} = this.state
    var result = results && results[facetedQ]
    var hits = result && result.hits && result.hits.hits || []

    if(!result || !hits || hits.length <= 1) return <span/>
    var wImg = ImageQuilt.getImagedResults(hits)
    return <ImageQuilt
      maxRows={1}
      maxWorks={7}
      artworks={wImg.length > 3 ? wImg : hits}
      {...this.props.quiltProps}
      />
  },

  handleResize() {
    this.setState({maxWidth: React.findDOMNode(this).clientWidth})
  },
  componentDidMount: function() {
    if(this.state.open) this.fetchResults()
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize)
  },

  getText() {
    return this.props.q || React.findDOMNode(this).querySelector('span').innerText
  },

  getQs() {
    var q = this.getText()
    var qs
    if(q.match(';')) {
      qs = q.split(/;/).map(_q => {
        return _q.replace(/^.*attributed to|unknown|artist|\w+ by|after/ig, '').trim()
      })
      return qs
    }
    return []
  },

  componentDidUpdate() {
    var text = this.getText()
    var query = this.state.query
    var sameQuery = query ? !!query.match(text) : true
    if(this.state.open && !sameQuery) this.setState({open: false})
  },

  fetchResults() {
    var {results, facetedQ} = this.state
    var q = this.getText()
    var facetedQ = this.props.facet ? `${this.props.facet}:"${encodeURIComponent(q)}"` : q

    this.setState({
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
})

module.exports = Peek
