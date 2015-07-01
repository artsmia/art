var React = require('react')
var Router = require('react-router')
var rest = require('rest')

var ArtworkImage = require('./artwork-image')
var Markdown = require('./markdown')

var L = window.L = require('leaflet-0.8-dev')
var museumTileLayer = require('../museumTileLayer')

var Artwork = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: (params) => {
      return rest('http://caption-search.dx.artsmia.org/id/'+params.id).then((r) => JSON.parse(r.entity))
    }
  },
  render() {
    var art = this.state.art
    var id = this.props.id || this.state.id
    const highlights = this.props.highlights
    const style = {
      margin: '90vh auto 0 auto',
      background: 'white',
      maxWidth: '35em',
      padding: '0 1em 1em 1em',
    }

    return (
      <div style={style}>
        <h1><span dangerouslySetInnerHTML={{__html: highlights && highlights.title || art.title}}></span> ({id}, <a href={`https://collections.artsmia.org/index.php?page=detail&id=${id}`}>#</a>)</h1>
        <p>{art.dated}</p>
        <h2><span dangerouslySetInnerHTML={{__html: highlights && highlights.artist || art.artist}}></span></h2>
        <p>{art.country}, {art.continent}</p>
        <p>{art.medium}</p>
        <p>{art.dimension}</p>
        <p>{art.creditline}</p>
        <ArtworkImage art={art} id={id} />
        <p>{art.room === 'Not on View' ? art.room : <strong>{art.room}</strong>}</p>
        <Markdown>{art.text}</Markdown>

        <div ref='map' id='map'></div>
        <a href="#" onClick={() => history.go(-1)}>&larr; back</a>
      </div>
    )
  },

  getInitialState() {
    var art = this.props.data.artwork
    return {
      art: art,
      id: this.props.id || art.id.replace('http://api.artsmia.org/objects/', '')
    }
  },

  componentDidMount() {
    var art = this.state.art
    if(art.restricted != 1) {
      this.map = L.map(this.refs.map.getDOMNode(), {
        crs: L.CRS.Simple,
        zoomControl: false,
      })
      this.map.setView([art.image_width/2, art.image_height/2], 0)
      rest('//tilesaw.dx.artsmia.org/'+this.state.id).then((data) => {
        this.tiles = L.museumTileLayer('http://{s}.tiles.dx.artsmia.org/{id}/{z}/{x}/{y}.png', {
          attribution: '',
          id: this.state.id,
          width: art.image_width,
          height: art.image_height,
          fill: true,
        })
        this.tiles.addTo(this.map)
        // this.tiles.fillContainer()
        window.tiles = this.tiles
      })
    }
  }
})

module.exports = Artwork
