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

    var minHeight = this.props.hideList ? '25rem' : '1rem'

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
          <Peek key={gallery} q={`room:G${gallery}`} />
        </div>}
      </div>

      {this.props.hideList || this.listGalleries()}
    </div>
  },

  listGalleries() {
    var gs = Object.keys(galleries).map(number => galleries[number])
    return <ul style={{margin: '1em'}}>
      {gs.map(g => <li><Link to="gallery" params={{gallery: g.id}}>{g.id} — {g.title}</Link></li>)}
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

module.exports = MapPage
