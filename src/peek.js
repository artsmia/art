var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')
var debounce = require('debounce')

var SEARCH = require('./search-endpoint')
var ClickToSelect = require('react-click-to-select')
var ImageQuilt = require('./image-quilt')

// TODO: I can't get onClick to work directly on <ClickToSelect>??

var Peek = React.createClass({
  mixins: [Router.State, Router.Navigation],
  propTypes: {
    children: React.PropTypes.string,
  },

  getInitialState() {
    var {q} = this.props
    var open = !!q
    if(!q) q = this.props.children

    return {
      open,
      results: {},
      offset: this.props.offset || 0,
      query: q,
      facetedQ: q && this.props.facet ? `${this.props.facet}:"${encodeURIComponent(q)}"` : q
    }
  },

  render() {
    var {results, facetedQ} = this.state
    var {child} = this.props
    var result = results && results[facetedQ]
    var Tag = this.props.tag
    var {showIcon} = this.props
    var icon = <i className="material-icons">{'expand_'+(this.state.open ? 'less' : 'more')}</i>
    var peekText = this.context.universal ?
      <Link to="searchResults" params={{terms: this.state.facetedQ || this.state.q}}>{this.props.children}</Link> :
      <ClickToSelect>{this.props.children}</ClickToSelect>

    return <Tag onClick={debounce(this.onClick, 200)} className="peek">
      {this.props.children && <i>
        {peekText}
        {!this.props.universal && showIcon && icon}
      </i>}
      {this.state.open && this.state.facetedQ && <div className="peek" style={{fontSize: '80%', maxWidth: this.state.maxWidth || "100%"}}>
        {result && this.quiltFromResults()}
        <Link to="searchResults" params={{terms: this.state.facetedQ}}>
          {result && result.hits && result.hits.total || 'search'} results for {this.state.query} {this.props.facet && `(${this.props.facet})`}
        </Link>
      </div>}
      {this.state.open && this.getQs().map((q) => <Peek facet={this.props.facet} q={q} key={q} />)}
    </Tag>
  },

  onClick() {
    if(this.state.open) return this.setState({open: false})

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
    var offset = this.props.offset || 0

    if(!result || !hits || hits.length <= 1) return <span/>
    var wImg = ImageQuilt.getImagedResults(hits).slice(offset, offset+10)
    return <ImageQuilt
      maxRows={1}
      maxWorks={7}
      artworks={wImg.length > 3 ? wImg : hits}
      {...this.props.quiltProps}
      onClick={this.linkToResults}
      disableHover={true}
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
    return this.props.q || this.state.q || this.props.children
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
    var sameQuery = query ? query === text || !!query.match(text) : true
    if((this.state.open || this.state.query) && (!text || !sameQuery)) {
      this.setState({open: false, query: null})
    }
  },

  fetchResults() {
    var {results, facetedQ} = this.state
    var q = this.getText()
    var facetedQ = this.props.facet ? `${this.props.facet}:"${encodeURIComponent(q)}"` : q

    this.setState({
      query: q,
      facetedQ: facetedQ,
    })

    this.state.results[facetedQ] || rest(`${SEARCH}/${facetedQ}?size=20`).then((r) => {
      var results = this.state.results
      results[facetedQ] = JSON.parse(r.entity)
      this.setState({
        results: results,
        loading: false,
      })
    })
  },

  linkToResults(art) {
    if(!art) return
    window.clickedArtwork = art
    this.transitionTo('searchResults', {terms: this.state.facetedQ})
  },

  getDefaultProps() {
    return {
      tag: "div",
      showIcon: true,
    }
  },
})
Peek.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
}

module.exports = Peek
