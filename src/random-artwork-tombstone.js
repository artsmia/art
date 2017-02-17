var React = require('react')
var Router = require('react-router')
var {Link} = Router
var rest = require('rest')

var Artwork = require('./_artwork')
var ArtworkPreview = require('./artwork-preview')
var SEARCH = require('./endpoints').search

module.exports = React.createClass({
  render() {
    var {art} = this.state
    var {fieldToHighlight} = this.props
    var highlight = (children, highlight) => highlight ? <span style={{color: 'red', fontWeight: 'bold', borderBottom: '1px solid black !important'}}>
      {children}
    </span> : children

    // and check on mobile = does touch work?
    var rawTitle = <Artwork.Title art={art} link={false} />
    var rawArtist = <Artwork.Creator art={art} />

    return art && <div key={fieldToHighlight}>
      {highlight(rawTitle, fieldToHighlight == 'title')}
      {highlight(rawArtist, fieldToHighlight == 'artist')}
      <Artwork.Tombstone art={art}
        highlightAccessionNumber={fieldToHighlight == 'accession number'}
        highlighter={highlight} />
    </div>
  },

  getInitialState() {
    return {
      art: null,
    }
  },

  componentDidMount() {
    var id = this.props.initialId

    var searchUrl = id ? `${SEARCH}/id/${id}` : `${SEARCH}/random/art`
    rest(searchUrl)
    .then(data => this.setState({art: JSON.parse(data.entity)}))
  },
})
