var React = require('react')
var  {Link} = require('react-router')
var rest = require('rest')

var {galleries, messages} = require('../../data/galleries.json')
var Markdown = require('../markdown')

var GalleryDecorator =  React.createClass({
  getGalleryInfo(gallery) {
    // gallery can either be `G215` or `room:G215` (or `room:"G215"`)
    var galleryId = gallery.match(/(room:)?"?([^"]*)"?/)[2]
    var number = galleryId.replace(/g/i, '')
    var gallery = galleries[number]
    this.fetchData(number)

    return {
      number,
      gallery,
      panel: this.props.galleryInfo,
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
    var {number, gallery, panel} = this.state
    var showFullInfo = this.props.showFullGalleryInfo
    if(panel && !showFullInfo) {
       panel = panel.slice(0, 200) + '…'
     }

     let [prevLink, nextLink] = this.nextPrevLinks()

    return <div style={{clear: 'both'}} className="decorator d-gallery">
      <div className="info">
        <img src={`http://artsmia.github.io/map/galleries/${number}.png`} />
        <div>
          {prevLink}
          <span> G{number} </span>
          {nextLink}
        </div>
      </div>
      {panel && <div>
        <Markdown>{panel}</Markdown>
        {!showFullInfo && <Link to='gallery' params={{gallery: number}}>More info</Link>}
      </div>}
      <hr style={{clear: 'both', visibility: 'hidden'}} />
    </div>
  },

  nextPrevLinks() {
    var {number, gallery, panel} = this.state

    return this.props.showFullGalleryInfo ?
      [<Link to='gallery' params={{gallery: gallery.prev}}>&larr; G{gallery.prev}</Link>, <Link to='gallery' params={{gallery: gallery.next}}>G{gallery.next} &rarr;</Link>] :
      [<Link to='searchResults' params={{terms: `G${gallery.prev}`}}>&larr; G{gallery.prev}</Link>, <Link to='searchResults' params={{terms: `G${gallery.next}`}}>G{gallery.next} &rarr;</Link>]
  },

  fetchData(number) {
    rest(`https://cdn.rawgit.com/artsmia/mia-gallery-panels/master/${number || this.state.number}.md`)
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
