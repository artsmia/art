var React = require('react')

var {Link} = require('react-router')

var ArtworkImage = require('./artwork-image')
var Markdown = require('./markdown')
var Peek = require('./peek')

var ArtworkPreview = React.createClass({
  getDefaultProps() {
    return {
      showLink: true,
    }
  },

  render() {
    var {art, style, showLink} = this.props

    var title = showLink ? 
      <Link to="artwork" params={{id: art.id}}>{art.title}</Link> :
      art.title

    return (
      <div className='objects-focus' style={style}>
        <h2>{title}, <span className='date'><Peek tag="span" showIcon={false}>{art.dated}</Peek></span></h2>
        <h5><Peek facet="artist">{art.artist}</Peek></h5>
        <ArtworkImage art={art} id={art.id} />
        <h6><Peek facet="room">{art.room}</Peek></h6>
        <div className='tombstone'>
          <Peek facet="medium" tag="span">{art.medium}</Peek><br />
          {art.dimension}<br/>
          <Peek facet="creditline" tag="span">{art.creditline}</Peek>
          {art.accession_number}
        </div>
        <Markdown>{art.text}</Markdown>
        {showLink && <Link to="artwork" params={{id: art.id}}>View Details &rarr;</Link>}
      </div>
    )
  },
})

module.exports = ArtworkPreview
