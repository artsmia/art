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
      <span className={cx('map', {open: this.state.open})} onClick={this.handleClick}>
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
    console.info('handleClick', this.state.open)
    if(!this.state.open) return this.setState({open: true})

    var text = this.getSvgText(event.target)
    var gallery = text.textContent.match(/(\d+a?)/)[0]
    this.changeGallery(gallery)
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
  },

  changeGallery(nextGallery) {
    this.transitionTo('gallery', {gallery: nextGallery})
  },

})

module.exports = Map
