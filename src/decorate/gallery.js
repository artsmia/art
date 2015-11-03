var React = require('react')
var  {Link} = require('react-router')

var {galleries, messages} = require('../../data/galleries.json')

var GalleryDecorator =  React.createClass({
  render() {
    if(this.props.notOnView) return <NotOnViewGalleryDecorator />
    var {gallery} = this.props
    // gallery can either be `G215` or `room:G215` (or `room:"G215"`)
    var galleryId = gallery.match(/(room:)?"?([^"]*)"?/)[2]
    var number = galleryId.replace(/g/i, '')
    var gallery = galleries[number]

    return <div style={{clear: 'both'}} className="decorator d-gallery">
      <img src={`http://artsmia.github.io/map/galleries/${number}.png`} />
      <div>
        <h3>{gallery.title}</h3>
        <Link to='searchResults' params={{terms: `G${gallery.prev}`}}>&larr; G{gallery.prev}</Link>
        <span> {galleryId} </span>
        <Link to='searchResults' params={{terms: `G${gallery.next}`}}>G{gallery.next} &rarr;</Link>
      </div>
      <hr style={{clear: 'both', visibility: 'hidden'}} />
    </div>
  }
})

module.exports = GalleryDecorator

var NotOnViewGalleryDecorator = React.createClass({
  render() {
    return <p>Very few of the artworks at Mia can be "on view" at any point in time.</p>
  }
})
