var React = require('react')
var Router = require('react-router')
var _fetch = require('whatwg-fetch')
var R = require('ramda')
window.R = R
window.transpose = function transpose(a) {
  return R.addIndex(R.map)(R.pipe(R.nthArg(1), R.nth, R.map(R.__, a)), R.head(a));
};

var Artwork = require('./artwork')
var _Artwork = require('./_artwork')
var imageCDN = require('./image-cdn')
var vis = require('./cloud-vision')

var ArtworkExtraModule = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: {
      art: Artwork.fetchData.artwork,
      vision: (params) => {
        if(params.id == 68667)
          return fetch('/vision/68667.json').then(response => response.json())

        return fetch(`http://api.artsmia.org/images/${params.id}/400/medium.jpg`)
        .then(response => response.blob())
        .then((image) => new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.readAsDataURL(image)
          reader.onloadend = (event) => {
            return resolve(event.target.result)
          }
        }))
        .then((base64) => base64.split(',')[1])
        .then(base64 => {
          var req = vis.buildRequest(base64)
          return vis.postRequest(req)
        })
        .then(response => response.json())
      }
    }
  },

  getInitialState() {
    var {vision} = this.props.data

    return {
      hasFaces: !!vision.responses[0].faceAnnotations,
    }
  },

  render() {
    var art = this.props.data.art
    var id = art.id.replace(/[^0-9]+/g, '')
    var imageURL = imageCDN(id)
    var {vision} = this.props.data
    var isImageValid = art.image == 'valid'

    return <section style={{padding: '3em 1em'}}>
      <_Artwork.Title art={art} link={true} />
      {isImageValid && <div>
        <img src={imageURL} onLoad={this.handleImageLoad} />
        {this.state.hasFaces && <canvas ref="annotateFaces" style={{verticalAlign: 'top'}} />}
        {this.state.hasFaces && <canvas ref="smartCrop" style={{verticalAlign: 'top'}} />}
        {vision && <ul>
          {vision.responses[0].labelAnnotations.map(label => <li>{label.description} ({label.score})</li>)}
        </ul>}
        {vision && <pre><code>{JSON.stringify(vision, null, 2)}</code></pre>}
      </div>}
    </section>
  },

  handleImageLoad(event) {
    this.setState({image: event.target})
    var {hasFaces} = this.state
    if(this.state.hasFaces) {
      this.buildAnnotatedImage(event.target)
      this.buildSmartCrop(event.target)
    }
  },

  buildAnnotatedImage(image) {
    var {vision} = this.props.data

    var c = React.findDOMNode(this.refs.annotateFaces)
    c.width = image.width
    c.height = image.height
    var ctx = c.getContext('2d')
    var img = new Image();
    img.onload = function(){
      ctx.drawImage(img, 0, 0);

      function drawBox(poly, color='red') {
        ctx.strokeStyle = color
        ctx.beginPath()
        var [first, ...rest] = poly.vertices
        var {x: x1, y: y1} = first
        ctx.moveTo(x1, y1)
        rest.concat(first).map(({x, y}) => ctx.lineTo(x, y))
        ctx.stroke()
        ctx.closePath()
      }

      vision.responses[0].faceAnnotations.map(faceData => {
        drawBox(faceData.boundingPoly, 'gray')
        drawBox(faceData.fdBoundingPoly)
      })
    };
    img.src = image.src;
    this.setState({annotatedFaces: c})
  },

  buildSmartCrop(image) {
    var {vision} = this.props.data
    var faces = vision.responses[0].faceAnnotations
    var l = transpose(faces.map(face => face.boundingPoly.vertices))
    var [topLeft, , bottomRight] = l

    var least = (({x: x1, y: y1}, {x: x2, y: y2}) => {
      return {x: R.min(x1, x2), y: R.min(y1, y2)}
    })
    var most = (({x: x1, y: y1}, {x: x2, y: y2}) => {
      return {x: R.max(x1, x2), y: R.max(y1, y2)}
    })

    var extent = [
      R.reduce(least, {x: 1000, y: 1000}, topLeft),
      R.reduce(most, {x: 0, y: 0}, bottomRight),
    ]
    console.info(extent)

    var width = extent[1].x - extent[0].x
    var height = extent[1].y - extent[0].y

    var c = React.findDOMNode(this.refs.smartCrop)
    var ctx = c.getContext('2d')
    var img = new Image();
    img.onload = function(){
      var pad = 50
      var [paddedWidth, paddedHeight] = R.map(R.add(pad*2), [width, height])
      c.width = paddedWidth
      c.height = paddedHeight
      ctx.drawImage(img, extent[0].x - pad, extent[0].y - pad, paddedWidth, paddedHeight, 0, 0, paddedWidth, paddedHeight)
    };
    img.src = image.src;
  },
})

module.exports = ArtworkExtraModule
