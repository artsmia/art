var React = require('react')
var Router = require('react-router')
var cx = require('classnames')
var Isvg = require('react-inlinesvg')

var Map = React.createClass({
  mixins: [Router.Navigation],

  render() {
    var {number, prevLink, nextLink} = this.props
    var thumbnail = <img src={`http://artsmia.github.io/map/galleries/${number}.png`} />
    var floor = this.props.floor || parseInt(number/100)
    var svg = <Isvg
      src={`/map/svgs/${floor}.svg`}
      onLoad={this.handleSvgLoad}
      preloader={React.createClass({render: () => thumbnail})}
    >
      {thumbnail}
    </Isvg>

    return <div>
      <span className={cx('map', {open: this.state.open})}
        onClick={this.handleClick}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        {this.state.open ? svg : thumbnail}
      </span>
      {number && prevLink && <div>
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

    var text = this.getSvgText(event.target)
    var gallery = text.textContent.match(/(\d+a?)/)[0]
    this.highlightGallery(text)
    this.changeGallery(gallery)
  },

  handleMouseOver() {
    if(!this.state.open) return // don't handle mouseover until map opens

    var text = this.getSvgText(event.target)
    var gallery = text.textContent.match(/(\d+a?)/)[0]
    this.hoverGallery(text)
  },

  handleMouseOut() {
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
    var accentColor = '#fff'
    var poly = element.parentElement.querySelector('polygon')
    poly.style.setProperty('fill', accentColor)
    return poly
  },

  resetGallery(poly) {
    // `style.fill` overrides the `fill` attribute without clobbering it
    // so we can reset it to the original color with `''`
    poly.style.setProperty('fill', '')
  },

  componentDidUpdate(_, prevState) {
    let prevActive = prevState.activePoly
    let prevHovered = prevState.hoveredPoly
    let {activePoly, hoveredPoly} = this.state

    if(prevActive != activePoly) this.resetGallery(prevActive)
    if(prevHovered != hoveredPoly && prevHovered != activePoly) this.resetGallery(prevHovered)
  },
})

module.exports = Map
