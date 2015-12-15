var React = require('react')
var cx = require('classnames')
var Isvg = require('react-inlinesvg')

var Map = React.createClass({
  render() {
    var {number, prevLink, nextLink} = this.props
    var thumbnail = <img src={`http://artsmia.github.io/map/galleries/${number}.png`} />
    var svg = <Isvg
      src={`http://localhost:1314/map/svgs/${parseInt(number/100)}.svg`}
      onLoad={this.handleSvgLoad}
    >
      oops no svg
    </Isvg>

    return <div>
      <span className={cx('map', {open: this.state.open})} onClick={this.handleClick}>
        {this.state.open ? svg : thumbnail}
      </span>
      <div>
        {prevLink}
        <span> G{number} </span>
        {nextLink}
      </div>
    </div>
  },

  getInitialState() {
    return {
      open: false,
    }
  },

  handleClick() {
    console.info('handleClick', this.state.open)
    if(!this.state.open) return this.setState({open: true})

    var text = this.getSvgText(event.target)
    var gallery = text.textContent.match(/(\d+a?)/)[0]
    this.props.changeTo(gallery)
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
})

module.exports = Map
