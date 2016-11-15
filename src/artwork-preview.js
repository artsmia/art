var React = require('react')
var Router = require('react-router')
var { Link } = Router
var ArtworkImage = require('./artwork-image')
var Markdown = require('./markdown')
var Peek = require('./peek')
var Artwork = require('./_artwork')
var highlighter = require('./highlighter')
var ArtworkDetails = require('./artwork-details')

var ArtworkPreview = React.createClass({
  getDefaultProps() {
    return {
      showLink: true,
    }
  },

  render() {
    var {art, style, showLink, highlights} = this.props
    var id = art.id.replace('http://api.artsmia.org/objects/', '')
    var highlight = highlighter.bind(null, art, highlights)

    var showHighlights = highlights && <div className='artwork-detail' style={{marginTop: '1em'}}>
      <hr />
      <ArtworkDetails
        art={art}
        highlights={highlights}
        skipFields={!this.props.showDuplicateDetails && "title style artist medium credit accession_number gallery text tags"}
        {...this.props}
      />
    </div>

    var details = showLink ? <Link to="artwork" params={{id: art.id}}>
      <div className="objects-page-link"><div className="objects-page-icon"></div>details</div>
    </Link> : ''

    return (
      <Artwork.Figure art={art} className='objects-focus' style={style} link={showLink}>
        <div className="art-details preview-header">
          {art.deaccessioned == 'true' && <DeaccessionedBanner art={art} />}
          {art.accession_number.match(/^L/i) && <LoanBanner art={art} />}
          <Artwork.Title art={art} link={showLink} {...this.props} />
          <Artwork.Creator art={art} {...this.props} />
          <Artwork.Tombstone art={art} {...this.props} />
          <h6><Peek facet="room" highlightedValue={highlight('room')}>{art.room}</Peek></h6>
          {this.props.children || <div>
            <div className="description" itemProp="description">
              <Markdown>{highlight('text')}</Markdown>
            </div>
            <Artwork.LinkBar art={art} link={showLink} />
            {showHighlights}
          </div>}
        </div>
      </Artwork.Figure>
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

var DeaccessionedBanner = React.createClass({
  render() {
    var {art} = this.props
    var date = art.deaccessionedDate.split('-')[0]
    var reason = art.deaccessionedReason

    return <div>
      <strong>DEACCESSIONED</strong>
      <p>
        This artwork was <Link to="/info/deaccessions">deaccessioned</Link>{reason && ` (${reason})`}
        &nbsp;{date && <span>in {date}.</span>}
      </p>
    </div>
  },
})

var LoanBanner = React.createClass({
  render() {
    var {art} = this.props
    var date = art.deaccessionedDate

    return <div>
      <strong>LOAN</strong>
      <p>
        This artwork was "loaned" to the museum by the owner. It was never owned by Mia. Loans are a common way to share art between museums.
      </p>
    </div>
  },
})
