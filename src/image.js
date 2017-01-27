var React = require('react')
var cx = require('classnames')
var LazyLoad = require('react-lazy-load')

var imageCDN = require('./image-cdn')
var {getFacetAndValue} = require('./artwork/creator')

const Image = React.createClass({
  render() {
    var {art, style, lazyLoad, ignoreStyle, ...other} = this.props
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
      style={ignoreStyle ? {maxWidth: '100%'} : style}
      src={this.imageURL()}
      onLoad={this.handleImageLoad}
      onError={this.handleError}
      className={classes}
      title={`${art.title}, ${getFacetAndValue(art)[1]}`}
      alt={art.description}
      {...other} />

    if(art.rights == 'Permission Denied') return <span />

    var image = !lazyLoad ? nakedImage : <LazyLoad wrapper="span" style={{display: 'inline'}} width={width} height={`${height}`}>
      {nakedImage}
    </LazyLoad>

    return image
  },

  imageURL() {
    var {id} = this.props.art

    return this.state.skipCDN ?
      `https://api.artsmia.org/images/${id}/400/medium.jpg` :
      imageCDN(id)
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
