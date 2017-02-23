var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var {Link} = Router
var debounce = require('debounce')

var galleries = require('../data/galleries.json').galleries
var Map = require('./map')
var Peek = require('./peek')

var MapPage = React.createClass({
  render() {
    var gallery = this.state && this.state.hoveredGallery
    var galleryInfo = galleries[gallery]

    var minHeight = this.props.hideList ? '15rem' : '1rem'

    return <div style={{position: 'relative'}}>
      <div ref="mapWrap" style={{backgroundColor: 'rgba(35, 35, 35, 0.8)', paddingBottom: '3em', width: '100%', overflow: 'scroll'}}>
        <Map
          startOpen={true}
          floor={3}
          style={{maxWidth: '60em', margin: '0 auto'}}
          onHover={this.handleGalleryHover}
          onMouseLeave={this.focusLost}
          onSvgLoad={this.handleSvgLoad}
        />

        {this.props.children && this.props.children}
      </div>

      <div style={{minHeight}}>
        {gallery && <div>
          <h3 style={{textAlign: 'center'}}>{galleryInfo.id} — {galleryInfo.title}</h3>
          <Peek
            key={`preview-${gallery}`} q={`room:G${gallery}`}
            showSingleResult={true}
            />
        </div>}
      </div>

      {this.props.hideList || this.listGalleries()}
    </div>
  },

  listGalleries() {
    var skipGalleries = [111, 112, 113, 114, 267, 268, 269, 270, 271, 272, 273, 274]
    var gs = Object.keys(galleries)
    .filter(g => skipGalleries.indexOf(parseInt(g)) < 0)
    .map(number => galleries[number])

    return <ul id="map-and-gallery-list" style={{margin: '1em'}}>
      {gs.map(g => <GalleryPeek key={g.id} g={g} style={{minHeight: '78px'}} />)}
    </ul>
  },

  // Wait a second before 'Peek'ing the hovered gallery
  handleGalleryHover(gallery) {
    clearTimeout(this.debouncedPeek)
    this.debouncedPeek = setTimeout(
      this.showGalleryPeek.bind(this, gallery),
      this.state && this.state.hoveredGallery ? 700 : 0
    )
  },

  showGalleryPeek(gallery) {
    this.setState({hoveredGallery: gallery})
  },

  componentWillUnmount() {
    clearTimeout(this.debouncedPeek)
  },

  focusLost() {
    clearTimeout(this.debouncedPeek)
  },

  handleSvgLoad() {
    ReactDOM.findDOMNode(this.refs.mapWrap).scrollLeft = 171
  }
})

var LazyLoad = require('react-lazy-load').default

var GalleryPeek = React.createClass({
  render() {
    var {g} = this.props
    var {universal} = this.context
    var link = {to: "gallery", params: {gallery: g.id}}
    var peek = <li style={{marginTop: !universal ? '1em' : 0}}>
      <Peek q={`room:G${g.id}`} linkProps={link} showIcon={false} showSingleResult={true}>
        <span>{g.id} — {g.title}</span>
      </Peek>
    </li>

    return universal ?
      peek :
      <div style={this.props.style}>
        <LazyLoad>{peek}</LazyLoad>
      </div>
  },
})
GalleryPeek.contextTypes = {
  universal: React.PropTypes.bool
}

module.exports = MapPage
