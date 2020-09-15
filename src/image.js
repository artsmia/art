var React = require('react')
var cx = require('classnames')
var LazyLoad = require('react-lazy-load').default

var imageCDN = require('./image-cdn')
var {getFacetAndValue} = require('./artwork/creator')
var rightsDescriptions = require('./rights-types.js')

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

    var url = this.imageURL()
    if(art.image_url) ignoreStyle = true

    const _style = {
      ...(ignoreStyle ? {maxWidth: '100%', maxHeight: '69vh'} : style),
      objectFit: 'cover',
    }

    var nakedImage = <img
      key={id}
      style={_style}
      src={url}
      key={url}
      onLoad={this.handleImageLoad}
      onError={this.handleError}
      className={classes}
      title={`${art.title}, ${getFacetAndValue(art)[1]}`}
      alt={art.description}
      {...other} />

    var rights = rightsDescriptions.getRights(art)
    if(rights == 'Permission Denied') return <span />

    var image = !lazyLoad ? nakedImage : <LazyLoad wrapper="span" style={{display: 'inline'}} width={width} height={`${height}`} className={classes}>
      {nakedImage}
    </LazyLoad>

    return image
  },

  imageURL() {
    var {customImage, size, showLink} = this.props
    var {id, image_url} = this.props.art

    if(image_url) return image_url

    // This watches out for the image to fail ONCE, then swaps in 
    // the 400px IIIF thumbnail
    // TODO: cascade from customImage -> S3 -> api.artsmia.org?
    const binaryFailImageUrl = this.state.skipCDN ?
      `https://iiif.dx.artsmia.org/${id}.jpg/full/400,/0/default.jpg` :
      customImage ? customImage(id) : imageCDN(id, size || showLink ? undefined : 800)

    // do this by tracking when a URL fails to load in this.state.failedLoads `[]`
    // (variable might need a re-name)
    // and checking that state against the image to be loaded here.
    // Options:
    // customImage by function
    // S3 thumbnail
    // IIIF thumbnail
    // non-existent image that will trigger the `error` state
    const imageCandidates = [
      customImage ? customImage(id) : null,
      imageCDN(id, size || showLink ? undefined : 800),
      // `https://iiif.dx.artsmia.org/${id}.jpg/-1,-1,800,800/800,/0/default.jpg`,
      `https://iiif.dx.artsmia.org/${id}.jpg/full/800,/0/default.jpg`,
      'http://0.api.artsmia.org/null.jpg'
    ].filter(url => url)
    const firstUnFailedImageUrl = imageCandidates.find(url => (this.state.failedLoads || []).indexOf(url) < 0)

    return firstUnFailedImageUrl
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
    const { src } = event.target
    const failedSoFar = this.state.failedLoads || []
    const failedLoads = [...failedSoFar, src]

    this.setState({failedLoads})

    // problems! the image isn't working
    if(src === 'http://0.api.artsmia.org/null.jpg') {
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
