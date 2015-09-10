var React = require('react')
var Router = require('react-router')
var { Link } = Router

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
    var id = art.id.replace('http://api.artsmia.org/objects/', '')

    var title = showLink ? 
      <Link to="artwork" params={{id: art.id}}>{art.title}</Link> :
      art.title
      
    var details = showLink ? <Link to="artwork" params={{id: art.id}}>
      <div className="objects-page-link"><div className="objects-page-icon"></div>details</div>
    </Link> : ''
      
    /* TO DO LOGIC: if no artist or artist unknown, replace with culture */

    return (
      <div className='objects-focus' style={style}>
        <ArtworkImage art={art} id={art.id} />
        <div className="art-details preview-header">
          {details}
          <h2>{title}</h2>
          <h5 className='date'><Peek tag="span" showIcon={false}>{art.dated}</Peek></h5>
          <h5><Peek facet="artist">{art.artist}</Peek></h5>
          <h6><Peek facet="room">{art.room}</Peek></h6>
          <div className='tombstone'>
            <Peek facet="medium" tag="span">{art.medium}</Peek><br />
            {art.dimension}<br/>
            <Peek facet="creditline" tag="span">{art.creditline}</Peek>
            {art.accession_number}
          </div>
          <Markdown>{art.text}</Markdown>
          <div className="link-bar">
            <i className="material-icons">favorite_border</i>
            <i className="material-icons">launch</i>
            {showLink && <Link to="artwork" params={{id: art.id}}>View Details &rarr;</Link>}
          </div>
        </div>
      </div>
    )
  },

  displayBio() {
    var {art} = this.props
    var {nationality, life_date} = art
    var lifeDateWithoutNationality = life_date && life_date.replace(nationality+', ', '');
    var nationAndDates = <span>
      {nationality && (<span><Peek facet="nationality" tag="span" showIcon={false}>{nationality}</Peek>, </span>)}
      {lifeDateWithoutNationality && <Peek facet="life_date" tag="span" showIcon={false}>{lifeDateWithoutNationality}</Peek>}
    </span>

    if(!nationality && !life_date) return <span/>
    return <div className='display-bio'>
      {nationAndDates}<br/>
      {art.role}
    </div>
  },
})

module.exports = ArtworkPreview
