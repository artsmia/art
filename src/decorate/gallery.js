var React = require('react')
var {Link} = require('react-router')
var rest = require('rest')

var {galleries, messages} = require('../../data/galleries.json')
var Markdown = require('../markdown')
var Map = require('../map')
var galleryPanelUrl = require('../endpoints').galleryPanel

var GalleryDecorator =  React.createClass({
  getGalleryInfo(gallery) {
    // gallery can either be `G215` or `room:G215` (or `room:"G215"`)
    // or, "Not on View", in which case skip retrieving info
    if(this.props.notOnView) return null
    var galleryId = gallery.match(/(room:)?"?([^"]*)"?/)[2]
    var number = galleryId.replace(/g/i, '')
    if(number == '266-274') number = '266-G274'
    var galleryInfo = galleries[number]
    this.fetchData(number)

    return {
      number,
      galleryInfo,
      panel: this.props.galleryPanel,
    }
  },

  getInitialState() {
    return this.getGalleryInfo(this.props.gallery)
  },

  componentWillReceiveProps(nextProps) {
    var dontUpdate = this.props.gallery == nextProps.gallery &&
      this.props.showFullInfo == nextProps.showFullInfo

    if(!dontUpdate) this.setState(this.getGalleryInfo(nextProps.gallery))
  },

  render() {
    if(this.props.notOnView) return <NotOnViewGalleryDecorator />
    var {number, galleryInfo, panel} = this.state
    var showFullInfo = this.props.showFullGalleryInfo
    if(panel && !showFullInfo) {
      panel = panel.split('\n').slice(0,3).join('\n')
    }

    let [prevLink, nextLink] = this.nextPrevLinks()

    let mapProps = {
      closed: true,
      number,
      prevLink,
      nextLink,
    }

    if(!panel && !galleryInfo) return <div>
      <h1>Gallery Not Found!</h1>
      <Link to="galleries">Show all galleries</Link>
    </div>

    return <div style={{clear: 'both'}} className="decorator d-gallery">
      <div>
        <Map {...mapProps} />
      </div>
      {(panel || galleryInfo) && <div className="info">
        {panel && <Markdown>{panel}</Markdown>}
        {galleryInfo && <p><strong>{galleryInfo.title}</strong></p>}
        {!showFullInfo && <Link to='gallery' params={{gallery: number}}>More info</Link>}
      </div>}
      <hr style={{clear: 'both', visibility: 'hidden'}} />
    </div>
  },

  nextPrevLinks() {
    var {number, galleryInfo, panel} = this.state
    if(!galleryInfo) return []

    var {prev, next} = galleryInfo

    var linkParams = (adjacentGallery) => this.props.showFullGalleryInfo ?
      {to: 'gallery', params: {gallery: adjacentGallery}} :
      {to: 'searchResults', params: {terms: `G${adjacentGallery}`}}

    return [
      prev && <Link {...linkParams(prev)}>&larr; G{prev}</Link>,
      next && <Link {...linkParams(next)}>G{next} &rarr;</Link>,
    ]
  },

  fetchData(number) {
    rest(galleryPanelUrl(number || this.state.number))
    .then((result) => {
      this.setState({
        panel: result.status.code == 200 ? result.entity : '',
      })
    })
  },

  componentDidMount() {
    if(!this.props.notOnView) this.fetchData()
  },
})

module.exports = GalleryDecorator

var NotOnViewGalleryDecorator = React.createClass({
  render() {
    var message = 'Very few of the artworks at Mia can be "on view" at any point in time.\n\n' +
    "The museum's [Print and Photograph Study Rooms](https://new.artsmia.org/visit/study-rooms/) offer individuals and groups the opportunity to examine off-view artworks (including woodcuts, engravings, etchings, lithographs, screenprints, drawings, watercolors, artist’s books, photography, and new media) upon appointment."

    return <Markdown>{message}</Markdown>
  }
})
