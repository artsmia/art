var React = require('react')
var cx = require('classnames')
var R = require('ramda')

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
    var {showDecorators, showByName} = this.state

    const decTabControls = <span style={{color: 'white'}}>
      {decorations.map(d => {
        const decoratorName = d.type.displayName 
        const shortName = decoratorName.replace('Decorator', '')
        const activeOrNotStyle = showByName[decoratorName] ? {border: '1px solid gold'} : {}

        return <button onClick={this.toggleDecoration} style={activeOrNotStyle}>
          {shortName}
        </button>}
      )}
    </span>

    const decsToShow = decorations.filter(d => {
      const decoratorName = d.type.displayName 
      return showByName[decoratorName]
    })

    const toggleDecsControl = <i className="control material-icons" onClick={this.toggleDecoration}>
        {false && 'expand_'+(showDecorators ? 'less' : 'more')}
        {showDecorators ? 'close' : 'info'}
      </i>

    return decorations.length > 0 && <div
      className={cx('decorator-wrap', {closed: !showDecorators})}
      onClick={!showDecorators && this.toggleDecoration}
    >
      <span style={{alignSelf: 'start'}}>
        {toggleDecsControl}
        {decTabControls}
      </span>
      {showDecorators ? decsToShow : <span />}
      {showDecorators && toggleDecsControl}
    </div>
  },

  getInitialState() {
    var {query, filters} = this.props.search
    var decorations = DecorationFinder(query, filters, this.props)

    let audioDecoratorMatches
    // Always show audio decorator.
    // Otherwise, show the first decorator matched when viewed on a desktop,
    // and collapse bar by default when on mobile to conserve space.
    const showByName = decorations.reduce((map, d, index) => {
      const decName = d.type.displayName
      audioDecoratorMatches = audioDecoratorMatches || decName === 'AudioDecorator'
      map[decName] = decName === 'AudioDecorator' || showDecorations && index === 0
      console.info({map, audioDecoratorMatches, decName})
      return map
    }, {})

    var showDecorations = !this.context.smallViewport || audioDecoratorMatches

    return {
      decorations,
      showDecorators: showDecorations,
      showByName,
      // TODO modify this when props change
    }
  },

  toggleDecoration(event) {
    event.preventDefault()
    event.stopPropagation()
    const {target} = event
    const decoratorToToggle = this.state.decorations.find(
      d => d.type.displayName === target.innerText+'Decorator'
    )

    this.setState(prevState => {
      const decToggleName = decoratorToToggle && decoratorToToggle.type.displayName
      const nextShowByName = {
        ...prevState.showByName,
        ...(decoratorToToggle ? {[decToggleName]: !prevState.showByName[decToggleName]} : {}),
      }

      const openCount = R.compose(R.length, R.toPairs, R.filter(R.identity))(nextShowByName)

      // If no specific decorator is open and the bar is clicked, select the first to be open
      const openDefault = !decoratorToToggle && openCount === 0 ? {
        [this.state.decorations[0].type.displayName]: true
      } : {}

      return {
        showByName: {
          ...nextShowByName,
          ...openDefault,
        },
        showDecorators: !decoratorToToggle
          ? !prevState.showDecorators
          : openCount !== 0,
      }
    })
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
  let terms = search ? search.match(/\w+.+|"(?:\\"|[^"])+"/g) || search.split(' ') : false
  if(filters) terms = terms.concat(filters.split('" ').map(f => f.trim()))
  if(!terms) return [] // search by ids `search/ids` doesn't have any terms

  var Decor = {
    "department:": (term) => <DepartmentDecorator department={term} params={params} key={term} />,
    ".*": (term) =>
        props.hits.filter(hit => hit._source['related:audio-stops']).length > 0 // [1]
        && <AudioDecorator term={term} params={params} key={term + '-audio'} {...props} />,
    "g[0-9]{3}a?": (gallery) => <GalleryDecorator gallery={gallery[0]} {...props} key={gallery} />,
    "Not on View": (gallery) => <GalleryDecorator notOnView={true} key={gallery} />,
    "highlight:": () => <HighlightsDecorator key="highlight" />,
    "recent:": () => <RecentDecorator key="recent" />,
    "rights:": (term) => <RightsDecorator term={term} params={params} key={term} />,
    // "^[0-9\.\*,\-a-zA-Z]+$": (term) => <NumberDecorator term={term} params={params} key={term + '-number'} {...props} />,
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
