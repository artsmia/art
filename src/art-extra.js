var React = require('react')
var Router = require('react-router')
var _fetch = require('whatwg-fetch')

var Artwork = require('./artwork')
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

    return <section>
      {isImageValid && <div style={{padding: '1em'}}>
        <img src={imageURL} onLoad={this.handleImageLoad} />
        {this.state.hasFaces && <canvas ref="canvas" style={{verticalAlign: 'top'}} />}
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
    if(this.state.hasFaces) this.buildAnnotatedImage(event.target)
  },

  buildAnnotatedImage(image) {
    var {vision} = this.props.data

    var c = React.findDOMNode(this.refs.canvas)
    c.width = image.width
    c.height = image.height
    var ctx = c.getContext('2d')
    ctx.strokeStyle = 'red'
    var img = new Image();
    img.onload = function(){
      ctx.drawImage(img, 0, 0);

      vision.responses[0].faceAnnotations.map(faceData => {
        ctx.beginPath()
        var [first, ...rest] = faceData.fdBoundingPoly.vertices
        var {x: x1, y: y1} = first
        ctx.moveTo(x1, y1)
        rest.concat(first).map(({x, y}) => ctx.lineTo(x, y))
        ctx.stroke()
        ctx.closePath()
      })
    };
    img.src = image.src;
    this.setState({canvas: c})
  }
})

module.exports = ArtworkExtraModule
