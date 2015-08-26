var React = require('react')
let LazyLoad = require('react-lazy-load')

var Markdown = require('./markdown')

var ArtworkImage = React.createClass({
  render() {
    let {art, id} = this.props
    let aspectRatio = art.image_width/art.image_height
    let maxWidth = Math.min(window.innerWidth, 400)
    let width = aspectRatio >= 1 ? maxWidth : maxWidth/aspectRatio
    let height = aspectRatio >= 1 ? maxWidth/aspectRatio : maxWidth
    let padding = width >= maxWidth ? -8 : -8+(maxWidth-width)/2

    return art.image == 'valid' && art.image_width > 0 && (
      <div className='artwork-image'>
        <LazyLoad height={height}>
          <img
            src={`http://api.artsmia.org/images/${id}/400/medium.jpg`}
            style={{maxWidth: maxWidth, margin: window.innerWidth <= 400 && `0 ${padding}`}} />
        </LazyLoad>
        <Markdown>{art.image_copyright}</Markdown>
      </div>
    )
  }
})

module.exports = ArtworkImage
