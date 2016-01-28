var React = require('react')
var Router = require('react-router')
var cx = require('classnames')
var Isvg = require('react-inlinesvg')

var Map = React.createClass({
  mixins: [Router.Navigation],

  render() {
    var {number, prevLink, nextLink, ...extraProps} = this.props
    var thumbnail = <img
        src={`http://artsmia.github.io/map/galleries/${number}.png`}
        onClick={this.handleClick}
        />
    var floor = this.state.floor
      || this.props.floor
      || parseInt(parseInt(number)/100)
    var svg = <div style={{cursor: 'pointer'}}>
      <div
        onClick={this.handleMapClick}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}>
        <Isvg
          src={`/map/svgs/${floor}.svg`}
          key={floor}
          onLoad={this.handleSvgLoad}
          preloader={React.createClass({render: () => thumbnail})}
        >
          {thumbnail}
        </Isvg>
      </div>
      <FloorControls
        map={this}
        active={floor}
        handleChange={this.changeFloor}
        closeMap={() => this.setState({open: false})}
        startOpen={this.props.startOpen}
        />
    </div>

    return <div {...extraProps}>
      <div className={cx('map', {open: this.state.open})}>
        {this.state.open ? svg : thumbnail}
      </div>
      {number && (prevLink || nextLink) && <div style={{textAlign: 'center'}}>
        {prevLink}
        <span> G{number} </span>
        {nextLink}
      </div>}
    </div>
  },

  getInitialState() {
    return {
      open: this.props.startOpen || false,
    }
  },

  handleClick() {
    if(!this.state.open) return this.setState({open: true})
  },

  handleMapClick(event) {
    var text = this.getSvgText(event.target)
    if(text) {
      var gallery = text.textContent.match(/(\d+a?)/)[0]
      if(266 <= parseInt(gallery) && parseInt(gallery) <= 274) gallery = '266-G274'
      this.highlightGallery(text)
      this.changeGallery(gallery)
    }
  },

  handleMouseOver(event) {
    if(!this.state.open) return // don't handle mouseover until map opens

    var text = this.getSvgText(event.target)
    if(text) {
      var gallery = text.textContent.match(/(\d+a?)/)[0]
      this.hoverGallery(text)
      this.props.onHover && this.props.onHover(gallery)
    }
  },

  handleMouseOut(event) {
    this.setState({hoveredPoly: null})
  },

  // recursively climb the SVG from where the click event happened
  // until we find a `<text>` node, which will tell us what gallery
  // was clicked
  getSvgText(node, wantedNode='text') {
    if(node.nodeName == wantedNode) return node

    var parent = node.parentElement
    if(parent.nodeName !== 'g') return null

    var next = parent.querySelector(wantedNode) || parent
    return this.getSvgText(next)
  },

  handleSvgLoad(event) {
    var allTexts = React.findDOMNode(this).querySelectorAll('svg text')
    var activeText = Array.from(allTexts)
    .filter(t => t.textContent == this.props.number)
    this.highlightGallery(activeText && activeText[0])
  },

  changeGallery(nextGallery) {
    this.transitionTo('gallery', {gallery: nextGallery})
  },

  highlightGallery(element) {
    var poly = this.colorGallery(element)
    var {activePoly} = this.state
    this.setState({activePoly: poly})
  },

  hoverGallery(element) {
    var poly = this.colorGallery(element)
    var {hoveredPoly} = this.state
    this.setState({hoveredPoly: poly})
  },

  colorGallery(element) {
    if(!element) return
    var accentColor = '#fff'
    var poly = element.parentElement.querySelector('polygon')
    poly && poly.style.setProperty('fill', accentColor)
    return poly
  },

  resetGallery(poly) {
    // `style.fill` overrides the `fill` attribute without clobbering it
    // so we can reset it to the original color with `''`
    poly && poly.style.setProperty('fill', '')
  },

  componentDidUpdate(prevProps, prevState) {
    let prevActive = prevState.activePoly
    let prevHovered = prevState.hoveredPoly
    let {activePoly, hoveredPoly} = this.state

    if(prevActive != activePoly) this.resetGallery(prevActive)
    if(prevHovered != hoveredPoly && prevHovered != activePoly) this.resetGallery(prevHovered)

    if(prevProps.number !== this.props.number) {
      this.handleSvgLoad() // reset the highlighted gallery
    }
  },

  changeFloor(toFloor) {
    this.setState({floor: toFloor})
  },
})

var FloorControls = React.createClass({
  render() {
    var buttonStyle = {display: 'block'}
    var floorControls = [3,2,1].map(_floor => {
      var text = _floor == this.props.active ? `floor ${_floor}` : _floor
      return <button style={buttonStyle} onClick={this.props.handleChange.bind(this.props.map, _floor)} key={_floor}>
        {text}
      </button>
    })

    var controlStyle = {
      float: 'right',
      margin: '-7em 2em 0 0',
      position: 'relative',
      zIndex: '10',
    }

    return <div style={controlStyle}>
      {floorControls}
      {!this.props.startOpen && <button style={buttonStyle} onClick={this.props.closeMap}>close map</button>}
    </div>
  },
})

module.exports = Map
