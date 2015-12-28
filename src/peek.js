var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')
var debounce = require('debounce')
var classnames = require('classnames')

var SEARCH = require('./endpoints').search
var ImageQuilt = require('./image-quilt')

var Peek = React.createClass({
  mixins: [Router.State, Router.Navigation],
  propTypes: {
    children: React.PropTypes.string,
  },

  // TODO: this is a mess, simplify to using props better so there's less
  // state to manage
  setup(props) {
    var qs
    var {q, facet} = props
    var open = !!q
    if(q && q.match(/:/) && !facet) {
      [facet, ...qs] = q.split(/:/)
      var q = qs.join(':')
    }
    if(!q) q = props.children

    return {
      facet,
      open,
      results: {},
      offset: props.offset || 0,
      query: q,
      facetedQ: this.getFacetedQ(q, facet),
      startedOpen: !!props.q
    }
  },

  getInitialState() {
    return this.setup(this.props)
  },

  render() {
    var {results, facetedQ, startedOpen} = this.state
    var {child, microdata} = this.props
    var result = results && results[facetedQ]
    var Tag = this.props.tag
    var {showIcon} = this.props
    var icon = <i className="material-icons">{'expand_'+(this.state.open ? 'less' : 'more')}</i>
    var linkProps = this.props.linkProps || {
      to: "searchResults",
      params: {terms: this.state.facetedQ || this.state.q}
    }
    var peekText = this.context.universal ?
      <Link itemProp={microdata ? "url" : ''} {...linkProps}>{this.props.children}</Link> :
      this.props.children

    return <Tag onClick={debounce(this.onClick, 200)} className={classnames("peek", {startedOpen: startedOpen, startedClosed: !startedOpen, open:this.state.open})} style={{cursor: 'pointer'}}>
      {this.props.children && <i>
        <span itemProp={microdata ? "name" : ''}>{peekText}</span>
        {!this.props.universal && showIcon && icon}
      </i>}
      {this.state.open && this.state.facetedQ && <div className="peek" style={{fontSize: '80%', maxWidth: this.state.maxWidth || "100%"}}>
        {result && this.quiltFromResults()}
        <Link {...linkProps} style={{width: '100%'}}>
          {result && result.hits && result.hits.total || 'search'} results for {this.state.query} {this.state.facet && `(${this.state.facet})`}
          <span style={{float: 'right', marginRight: '10px'}} className="more-results-link">View more results</span>
        </Link>
      </div>}
      {this.state.open && this.getQs().map((q) => <Peek facet={this.state.facet} q={q} key={q} />)}
    </Tag>
  },

  onClick() {
    if(this.state.startedOpen) return
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

  getFacetedQ(q, facet) {
    var q = q || (this.state ? this.state.query : "")
    var facet = facet || this.state && this.state.facet
    return facet ? `${facet}:"${encodeURIComponent(q.replace(/"/g, ''))}"` : q
  },

  getQs() {
    var q = this.state.query
    if(q.match(';')) {
      return q.split(/;/).map(_q => {
        return _q.replace(/^.*attributed to|unknown|artist|\w+ by|after/ig, '').trim()
      })
    }
    return []
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.setup(nextProps))
  },

  fetchResults() {
    var {results, facetedQ} = this.state

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
    if(this.props.directLinkTo) {
      var url = art._source[`related:${this.props.directLinkTo}`]
      if(url) return window.location = url
    }
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
