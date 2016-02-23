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
    this.setState(this.getGalleryInfo(nextProps.gallery))
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

    var info = panel || `# ${galleryInfo.title}`

    return <div style={{clear: 'both'}} className="decorator d-gallery">
      <div>
        <Map {...mapProps} />
      </div>
      {info && <div className="info">
        <Markdown>{info}</Markdown>
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
    this.fetchData()
  },
})

module.exports = GalleryDecorator

var NotOnViewGalleryDecorator = React.createClass({
  render() {
    return <p>Very few of the artworks at Mia can be "on view" at any point in time.</p>
  }
})
