var React = require('react')
var cx = require('classnames')
var LazyLoad = require('react-lazy-load').default

var imageCDN = require('./image-cdn')
var {getFacetAndValue} = require('./artwork/creator')

const Image = React.createClass({
  render() {
    var {art, style, lazyLoad, ignoreStyle, customImage, ...other} = this.props
    var {id} = art
    var {width, height} = style

    var classes = cx('image', {
      loading: !this.state.loaded,
      loaded: this.state.loaded,
      error: this.state.error,
      invalid: this.state.error,
    })

    var loadingStyle = {
      ...style,
    }

    var nakedImage = <img
      key={id}
      style={ignoreStyle ? {maxWidth: '100%', maxHeight: '67vh'} : style}
      src={this.imageURL()}
      key={this.imageURL()}
      onLoad={this.handleImageLoad}
      onError={this.handleError}
      className={classes}
      title={`${art.title}, ${getFacetAndValue(art)[1]}`}
      alt={art.description}
      {...other} />

    if(art.rights == 'Permission Denied') return <span />

    var image = !lazyLoad ? nakedImage : <LazyLoad wrapper="span" style={{display: 'inline'}} width={width} height={`${height}`} className={classes}>
      {nakedImage}
    </LazyLoad>

    return image
  },

  imageURL() {
    var {customImage, size, showLink} = this.props
    var {id} = this.props.art

    // TODO: cascade from customImage -> S3 -> api.artsmia.org?
    return this.state.skipCDN ?
      `https://api.artsmia.org/images/${id}/400/medium.jpg` :
      customImage ? customImage(id) : imageCDN(id, size || showLink ? undefined : 800)
  },

  componentWillReceiveProps(nextProps) {
    if(this.props.art !== nextProps.art) this.setState({skipCDN: false})
  },

  handleImageLoad() {
    this.setState({loaded: true})
  },

  // if the image doesn't load, it's probably because it's not on the CDN
  // yet. Fall back and load it from the API
  // If it also won't load from there, we've got problems
  handleError(event) {
    if(!this.state.skipCDN) {
      this.setState({skipCDN: true})
    } else { // problems! the image isn't working on the CDN or via the api.
      this.setState({loaded: true, error: true})
      this.props.art.image = 'invalid' 
      this.props.onImageInvalidation && this.props.onImageInvalidation()
    }
  },

  getInitialState() {
    return {
      loaded: this.context.universal || false,
      skipCDN: false,
    }
  },

  getDefaultProps() {
    return {
      ignoreStyle: false,
    }
  },
})
Image.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
}

module.exports = Image
