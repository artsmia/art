var React = require('react')
let LazyLoad = require('react-lazy-load').default

var Markdown = require('./markdown')
var Image = require('./image')
var rightsDescriptions = require('./rights-types.js')

var ArtworkImage = React.createClass({
  render() {
    let {art, id, customImage, style, containerStyle, ignoreStyle} = this.props
    let aspectRatio = art.image_width/art.image_height
    let maxWidth = window.innerWidth ? Math.min(window.innerWidth, 400) : 400
    let width = aspectRatio >= 1 ? maxWidth : maxWidth/aspectRatio
    let height = aspectRatio >= 1 ? maxWidth/aspectRatio : maxWidth
    let padding = width >= maxWidth ? -8 : -8+(maxWidth-width)/2
    style = style || {width: width, height: height}
    containerStyle = {minHeight: '173px', ...containerStyle}

    var image = <Image art={art}
      style={style}
      ignoreStyle={ignoreStyle}
      itemProp="image"
      alt={art.description}
      customImage={customImage}
      key={id}
      lazyLoad={this.props.lazyLoad} />

    var rights = rightsDescriptions.getRights(art)
    var showImage = !!customImage || art.image == 'valid' && art.image_width > 0 && rights !== 'Permission Denied'

    return showImage && (
      <div className='artwork-image' style={containerStyle}>
        {image}
        <Markdown>{art.image_copyright}</Markdown>
      </div>
    )
  },

  getDefaultProps() {
    return {lazyLoad: true}
  },
})

module.exports = ArtworkImage
