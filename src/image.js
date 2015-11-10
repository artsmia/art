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
    style.transition = 'opacity 1s ease-in'

    var nakedImage = <img style={style}
      key={id}
      src={`http://api.artsmia.org/images/${id}/400/medium.jpg`}
      onLoad={this.handleImageLoad}
      onError={this.handleError}
      className={classes}
      {...other} />

    var backgroundOpacity = Math.max(100-this.state.percentLoaded, 10)/100
    var loadingStyle = {
      ...style,
      boxSizing: 'border-box',
      backgroundColor: `rgba(35, 35, 35, ${backgroundOpacity})`,
    }
    console.info('backgroundColor', `rgba(35, 35, 35, ${backgroundOpacity})`)

    var Tag = this.state.loaded ? 'img' : 'span'
    var image = !lazyLoad ? nakedImage : <LazyLoad wrapper="span" style={{display: 'inline'}} width={width} onLoad={this.beginImageLoad}>
      <img
        key={id}
        className={classes}
        style={!this.state.loaded ? loadingStyle : style}
        src={this.state.loaded ? this.state.blob : ''}
        {...other} />
    </LazyLoad>

    return image
  },

  handleImageLoad() {
    this.setState({loaded: true, blob: this.img.src})
    setTimeout(this.swapBlobForURL, 1000)
  },

  swapBlobForURL() {
    var id = this.props.art.id
    this.setState({blob: `http://api.artsmia.org/images/${id}/400/medium.jpg`})
  },

  handleError(event) {
    console.info('error', event)
  },

  handleProgress(percent) {
    // console.info(this.props.art.id, percent)
    this.setState({percentLoaded: percent})
  },

  dropWrapper() {
    this.setState({useWrapper: false})
  },

  getInitialState() {
    return {
      loaded: false,
      useWrapper: true,
      percentLoaded: 0,
    }
  },

  beginImageLoad() {
    var id = this.props.art.id
    var img = new Image()
    img.load(
      `http://api.artsmia.org/images/${id}/400/medium.jpg`,
      this.handleProgress,
      this.handleImageLoad
    )
    this.img = img
  }
})

module.exports = Image

// https://stackoverflow.com/questions/14218607/javascript-loading-progress-of-an-image
Image.prototype.load = function(url, onProgress, onLoad) {
  var thisImg = this;
  var xmlHTTP = new XMLHttpRequest();
  xmlHTTP.open('GET', url,true);
  xmlHTTP.responseType = 'arraybuffer';
  xmlHTTP.onload = function(e) {
    var blob = new Blob([this.response]);
    thisImg.src = window.URL.createObjectURL(blob);
    onLoad && onLoad()
  };
  xmlHTTP.onprogress = function(e) {
    thisImg.completedPercentage = parseInt((e.loaded / e.total) * 100);
    onProgress && onProgress(thisImg.completedPercentage)
  };
  xmlHTTP.onloadstart = function() {
    thisImg.completedPercentage = 0;
  };
  xmlHTTP.send();
};

Image.prototype.completedPercentage = 0;

