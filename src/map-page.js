var React = require('react')
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

    return <div>
      <div style={{backgroundColor: 'rgba(35, 35, 35, 0.8)', paddingBottom: '3em', width: '100%', overflow: 'scroll'}}>
        <Map
          startOpen={true}
          floor={3}
          style={{maxWidth: '60em', margin: '0 auto'}}
          onHover={this.handleGalleryHover}
          onLeave={this.focusLost}
        />
      </div>

      <div style={{minHeight}}>
        {gallery && <div>
          <h3 style={{textAlign: 'center'}}>{galleryInfo.id} — {galleryInfo.title}</h3>
          <Peek key={`preview-${gallery}`} q={`room:G${gallery}`} />
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

    return <ul style={{margin: '1em'}}>
      {gs.map(g => <GalleryPeek key={g.id} g={g} style={{minHeight: '78px'}} />)}
    </ul>
  },

  handleGalleryHover(gallery) {
    this.debouncedPeek(gallery)
  },

  componentWillMount() {
    this.debouncedPeek = debounce((gallery) => this.setState({hoveredGallery: gallery}), 300)
  },
  componentWillUnmount() {
    this.debouncedPeek = undefined
  },

  focusLost() {
    debugger
  }
})

var LazyLoad = require('react-lazy-load')

var GalleryPeek = React.createClass({
  render() {
    var {g} = this.props
    var {universal} = this.context
    var link = {to: "gallery", params: {gallery: g.id}}
    var peek = <li style={{marginTop: !universal ? '1em' : 0}}>
      <Peek q={`room:G${g.id}`} linkProps={link} showIcon={false}>
        {g.id} — {g.title}
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
