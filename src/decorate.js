var React = require('react')
var cx = require('classnames')

var Markdown = require('./markdown')

var DepartmentDecorator = require('./decorate/department')
var GalleryDecorator = require('./decorate/gallery')
var HighlightsDecorator = require('./decorate/highlights')
var RecentDecorator = require('./decorate/recent')
var RightsDecorator = require('./decorate/rights')
var AudioDecorator = require('./decorate/audio')
var NumberDecorator = require('./decorate/number')

var Decorate = React.createClass({
  render() {
    var {query, filters} = this.props.search
    if(!query && !filters) return <span />
    var decorations = DecorationFinder(query, filters, this.props)
    var {showDecorators} = this.state

    return decorations.length > 0 && <div
      className={cx('decorator-wrap', {closed: !showDecorators})}
      onClick={!showDecorators && this.toggleDecoration}
    >
      {showDecorators && decorations}
      <i className="control material-icons" onClick={this.toggleDecoration}>
        {false && 'expand_'+(showDecorators ? 'less' : 'more')}
        {showDecorators ? 'close' : 'info'}
      </i>
    </div>
  },

  getInitialState() {
    return {
      showDecorators: !this.context.smallViewport,
    }
  },

  toggleDecoration() {
    this.setState({showDecorators: !this.state.showDecorators})
  },

  componentWillReceiveProps(nextProps) {
    // unhide decorators when query changes
    var {query, filters} = this.props.search
    var nextQuery = nextProps.search.query
    var nextFilters = nextProps.search.filters

    if(query !== nextQuery || filters !== nextFilters) this.setState({showDecorators: true})
  },
})
Decorate.contextTypes = {
  smallViewport: React.PropTypes.bool,
}

module.exports = Decorate

var DecorationFinder = (search, filters, props) => {
  let {params} = props
  let terms = search.match(/\w+.+|"(?:\\"|[^"])+"/g) || search.split(' ')
  if(filters) terms = terms.concat(filters.split('" ').map(f => f.trim()))

  var Decor = {
    "department:": (term) => <DepartmentDecorator department={term} params={params} key={term} />,
    "g[0-9]{3}a?": (gallery) => <GalleryDecorator gallery={gallery[0]} {...props} key={gallery} />,
    "Not on View": (gallery) => <GalleryDecorator notOnView={true} key={gallery} />,
    "highlight:": () => <HighlightsDecorator key="highlight" />,
    "recent:": () => <RecentDecorator key="recent" />,
    "rights:": (term) => <RightsDecorator term={term} params={params} key={term} />,
    ".*": (term) =>
        props.hits.filter(hit => hit._source['related:audio-stops']).length > 0 // [1]
        && <AudioDecorator term={term} params={params} key={term + '-audio'} {...props} />,
    // "^[0-9\.,a-zA-Z]+$": (term) => <NumberDecorator term={term} params={params} key={term + '-number'} {...props} />,
  }

  // [1] Here we 'gate' a decorator with certain conditions - it will only show when 
  // there are hits with audio stops.
  // TODO it would be nice if the decorator itself could define the conditions
  // under which is should display

  let m = Object.keys(Decor).reduce((matches, d) => {
    var _m = terms.filter(term => term.match(new RegExp(d, 'i')))
    if(_m.length > 0) matches[d] = _m
    return matches
  }, {})

  return Object.keys(m).map(key => {
    const decorators = Decor[key](m[key])

    return decorators
  }).filter(component => component)
}
