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
var ArtistDecorator = require('./decorate/artist')

var Decorate = React.createClass({
  render() {
    var {query, filters} = this.props.search
    if(!query && !filters) return <span />
    var decorations = DecorationFinder(query, filters, this.props, this.removeDecorator)
    var {showDecorators: _showDecs, showByName, removedDecorators} = this.state

    const decTabControls = <span style={{color: 'white'}}>
      {decorations.map(d => {
        const decoratorName = d && d.type.displayName 
        const shortName = decoratorName.replace('Decorator', '')
        const activeOrNotStyle = showByName[decoratorName] ? {border: '1px solid gold'} : {}
        const isRemoved = removedDecorators[decoratorName]

        return isRemoved ? <span /> : <button onClick={this.toggleDecoration} style={activeOrNotStyle}>
          {shortName}
        </button>}
      )}
    </span>

    const decsToShow = decorations.filter(d => {
      const decoratorName = d && d.type.displayName 
      return showByName[decoratorName]
    })
    const showDecorators = decsToShow && decsToShow.length > 0 && _showDecs

    const toggleDecsControl = <i className="control material-icons" onClick={this.toggleDecoration}>
        {false && 'expand_'+(showDecorators ? 'less' : 'more')}
        {showDecorators ? 'close' : 'info'}
      </i>

    const decNames = decorations.map(d => d.type.displayName)
    const allHidden = decorations && removedDecorators &&
      JSON.stringify(decNames) == JSON.stringify(Object.keys(removedDecorators))

    return decorations.length > 0 && !allHidden && <div
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

  getInitialState(_props) {
    const props = _props || this.props
    var {query, filters} = props.search
    var decorations = DecorationFinder(query, filters, props, this.removeDecorator.bind(this))
    const decNames = decorations.map(d => d.type.displayName)

    var showDecorations = !this.context.smallViewport
    let audioDecoratorMatches
    let artistDecoratorMatches
    // Always show audio decorator.
    // Otherwise, show the first decorator matched when viewed on a desktop,
    // and collapse bar by default when on mobile to conserve space.
    const showByName = decorations.reduce((map, d, index) => {
      const decName = d.type.displayName
      audioDecoratorMatches = audioDecoratorMatches || decName === 'AudioDecorator'
      artistDecoratorMatches = artistDecoratorMatches || decName === 'ArtistDecorator'
      map[decName] = 
        decName === 'ArtistDecorator' ||
        (decName === 'AudioDecorator' && !!query.match(/^\d+$/))

      return map
    }, {})

    var showDecorators = !this.context.smallViewport || artistDecoratorMatches || audioDecoratorMatches

    var s = {
      decorations,
      showDecorators,
      showByName,
      removedDecorators: {},
    }
    return s
  },

  toggleDecoration(event) {
    event.preventDefault()
    event.stopPropagation()
    const {target} = event
    const decoratorToToggle = this.state.decorations.find(
      d => d.type.displayName === target.innerText+'Decorator'
    )

    // if decorator bar is minimized and the clicked decorator is already 'on',
    // maximize it instead of toggling the clicked decorator in the minimized bar
    this.setState(prevState => {
      const decToggleName = decoratorToToggle && decoratorToToggle.type.displayName
      const nextShowByName = {
        ...prevState.showByName,
        ...(decoratorToToggle ? {
          [decToggleName]: !prevState.showDecorators || !prevState.showByName[decToggleName]
        } : {}),
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
    // update decorators when query changes
    var {query, filters} = this.props.search
    var nextQuery = nextProps.search.query
    var nextFilters = nextProps.search.filters

    if(query !== nextQuery || filters !== nextFilters) {
      this.setState(this.getInitialState(nextProps))
    }
  },

  // Provide this to subcomponent decorators so each decorator can
  // remove itself from the list e.g. when making an API call
  // and finding no results
  removeDecorator(decoratorName) {
    console.info('removeDecorator', {decoratorName})

    this.setState({
      showByName: {...this.state.showByName, [decoratorName]: false},
      removedDecorators: {...this.state.removedDecorators, [decoratorName]: true},
      showDecorators: false,
    })
  },
})
Decorate.contextTypes = {
  smallViewport: React.PropTypes.bool,
}

module.exports = Decorate

var DecorationFinder = (search, filters, props, removeFn) => {
  let {params, hits} = props
  let terms = search ? search.match(/\w+.+|"(?:\\"|[^"])+"/g) || search.split(' ') : false
  if(filters) terms = terms.concat(filters.split('" ').map(f => f.trim()))
  if(!terms) return [] // search by ids `search/ids` doesn't have any terms

  // first and second result are of the same artist, indicating that this
  // search is about that artist overall?
  // cancel this assumption when there's a `facet: ed` query that ISNT `artist:`
  const firstArtist = hits && hits.length > 0 && hits[0]._source.artist
  const nonArtistFacetedTerm = terms.find(t => t.match(':') && !t.match(/artist:/i))
  const artistRegexpName = hits && hits[1] && hits[1]._source.artist.replace('?', '')
  const hitsFeatureSingleArtist = artistRegexpName && hits.length > 0 && (
      hits.length == 1 ||
      // are the first and second artists the same, and not an empty string which
      // breaks the regex comparison?
      !!(
        firstArtist !== "" && hits[1]._source.artist.match(new RegExp(firstArtist, 'i')) ||
        firstArtist.match(new RegExp(artistRegexpName, 'i')) && hits[1]._source.artist !== ""
      )
    )
    && !nonArtistFacetedTerm

  var Decor = {
    // call the artist decorator beyond just when searching for `artist:` - if the first and second hits
    // both match the artist, show the decorator?
    // "artist:": (term) => <ArtistDecorator artist={term} params={params} key={term} remove={removeFn} />,
    ".+": (term) => 
      hitsFeatureSingleArtist &&
      <ArtistDecorator artist={hitsFeatureSingleArtist ? [firstArtist] : term} params={params} key={term} remove={removeFn} />,
    "department:": (term) => <DepartmentDecorator department={term} params={params} key={term} />,
    "g[0-9]{3}a?": (gallery) => <GalleryDecorator gallery={gallery[0]} {...props} key={gallery} />,
    "Not on View": (gallery) => <GalleryDecorator notOnView={true} key={gallery} />,
    "highlight:": () => <HighlightsDecorator key="highlight" />,
    "recent:": () => <RecentDecorator key="recent" />,
    "rights_type:": (term) => <RightsDecorator term={term} params={params} key={term} />,
    ".*": (term) =>
        hits.filter(hit => hit._source['related:audio-stops']).length > 0 // [1]
        && <AudioDecorator term={term} params={params} key={term + '-audio'} {...props} />,
    // "^[0-9\.\*,\-a-zA-Z]+$": (term) => <NumberDecorator term={term} params={params} key={term + '-number'} {...props} />,
  }

  // [1] Here we 'gate' a decorator with certain conditions - it will only show when 
  // there are hits with audio stops.
  // TODO it would be nice if the decorator itself could define the conditions
  // under which is should display
  // for ArtistDecorator I came up with the idea of the decorator rendering, doing it's stuff,
  // and from there deciding if "what it did" means anything. If not, the decorator is provided
  // with a `removeDecorator` prop which it can use to 'turn itself off'… Not ideal but OK

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
