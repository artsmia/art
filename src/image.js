var React = require('react')
var cx = require('classnames')
var LazyLoad = require('react-lazy-load')

var imageCDN = require('./image-cdn')

const Image = React.createClass({
  render() {
    var {art, style, lazyLoad, ignoreStyle, ...other} = this.props
    var {id} = art
    var {width, height} = style

    var classes = cx('image', {
      loading: !this.state.loaded,
      loaded: this.state.loaded,
    })

    var loadingStyle = {
      ...style,
    }

    var nakedImage = <img
      key={id}
      style={ignoreStyle ? {} : style}
      src={this.imageURL()}
      onLoad={this.handleImageLoad}
      onError={this.handleError}
      className={classes}
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
      `http://api.artsmia.org/images/${id}/400/medium.jpg` :
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
  handleError(event) {
    console.info(event.target.src)
    this.setState({skipCDN: true})
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
