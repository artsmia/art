var React = require('react')
var Router = require('react-router')
var {Link} = Router
var rest = require('rest')

var RandomArtworkContainer = require('./random-artwork')
var Artwork = require('./_artwork')
var SEARCH = require('./endpoints').search

var TombstoneExample = React.createClass({
  render() {
    var {art} = this.props
    var {fieldToHighlight} = this.props
    var highlight = (children, highlight) => highlight ? <span style={{color: 'red', fontWeight: 'bold', borderBottom: '1px solid black !important'}}>
      {children}
    </span> : children

    // and check on mobile = does touch work?
    var rawTitle = <Artwork.Title art={art} link={false} />
    var rawArtist = <Artwork.Creator art={art} peek={false} />

    return art && <div className="tombstoneHelper" key={fieldToHighlight}>
      {highlight(rawTitle, fieldToHighlight == 'title')}
      {highlight(rawArtist, fieldToHighlight == 'artist')}
      <Artwork.Tombstone art={art}
        showPeeks={false}
        highlightAccessionNumber={fieldToHighlight == 'accession number'}
        highlighter={highlight} />
    </div>
  },
})

var RandomTombstoneExample = RandomArtworkContainer(TombstoneExample)

module.exports = RandomTombstoneExample
