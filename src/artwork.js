var React = require('react')
var Router = require('react-router')
var rest = require('rest')

var ArtworkImage = require('./artwork-image')
var Markdown = require('./markdown')

var L = window.L = require('leaflet-0.8-dev')
var museumTileLayer = require('../museumTileLayer')

let mui = require('material-ui')
let ThemeManager = new mui.Styles.ThemeManager()
let Card = mui.Card;
let CardHeader = mui.CardHeader;
let CardMedia = mui.CardMedia;
let CardActions = mui.CardActions;
let CardText = mui.CardText;

var Artwork = React.createClass({
    
    childContextTypes: {
        muiTheme: React.PropTypes.object
    },
    
    getChildContext: function() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    },
  
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
      <Card style={{maxWidth: '35em', margin: '90vh auto 0 auto', padding: '0 1em 1em 1em'}}>
        <CardHeader title={{__html: highlights && highlights.title || art.title}}  subtitle={art.dated} avatar="http://lorempixel.com/100/100/nature/" />
        <h2><span dangerouslySetInnerHTML={{__html: highlights && highlights.artist || art.artist}}></span></h2>
        <CardText>{art.country}, {art.continent} </CardText>
        <CardText>{art.medium}</CardText>
        <CardText>{art.dimension}</CardText>
        <CardText>{art.creditline}</CardText>
        <CardMedia>
        <ArtworkImage art={art} id={id} />
        </CardMedia>
        <CardText>{art.room === 'Not on View' ? art.room : <strong>{art.room}</strong>}</CardText>
        <CardText>{art.text}</CardText>

        <div ref='map' id='map'></div>
        <a href="#" onClick={() => history.go(-1)}>&larr; back</a>
      </Card>
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
