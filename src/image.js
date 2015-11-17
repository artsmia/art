var React = require('react')
var cx = require('classnames')
var LazyLoad = require('react-lazy-load')

const Image = React.createClass({
  render() {
    var {art, style, lazyLoad, ...other} = this.props
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
      style={style}
      src={`http://api.artsmia.org/images/${id}/400/medium.jpg`}
      onLoad={this.handleImageLoad}
      onError={this.handleError}
      className={classes}
      {...other} />

    var image = !lazyLoad ? nakedImage : <LazyLoad wrapper="span" style={{display: 'inline'}} width={width}>
      {nakedImage}
    </LazyLoad>

    return image
  },

  handleImageLoad() {
    this.setState({loaded: true})
  },

  handleError(event) {
    console.info('error', event)
  },

  getInitialState() {
    return {
      loaded: false,
    }
  },
})

module.exports = Image
