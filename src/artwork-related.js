var React = require('react')
var rest = require('rest')
var cx = require('classnames')
var {Link} = require('react-router')
var ga = require('react-ga')
var R = require('ramda')

var Markdown = require('./markdown')
var imageCDN = require('./image-cdn')

var artstoryStampStyle = {
  backgroundPosition: 'center center',
  backgroundSize: 'contain',
}

var ArtworkRelatedContent = React.createClass({
  render() {
    var {art} = this.props
    if(!art) return <span/>

    var links = Object.keys(art).filter(key => key.match('related:'))
    .reduce((relateds, key) => {
      var linkOrListOfLinks = (typeof art[key] == 'string') ? JSON.parse(art[key]) : art[key]
      Array.isArray(linkOrListOfLinks) ?
          relateds = relateds.concat(linkOrListOfLinks) :
          relateds.push(linkOrListOfLinks)

      return relateds
    }, [])

    var explore = links.filter(link => link.type !== "exhibition")
    var exhibitions = links.filter(link => link.type == "exhibition")
    // only show exhibitions tagged `rotation`
    var significantExhibitions = exhibitions.filter(ex => ex.rotation)

    var sortedExploreContent = R.sortBy(({type}) => ({
      audio: 17,
      video: 13,
      artstory: 9,
      'mia-story': 5,
      newsflash: 1,
    }[type]), explore).reverse()

    console.info('sorting', {sortedExploreContent, types: sortedExploreContent.map(c => c.type)})

    var meat = <div className="explore">
      {sortedExploreContent.map(this.build)}
    </div>
    var exhibition_wrap = <div className="exhibition_item">
      {significantExhibitions.map(this.build)}
    </div>

    var bones = this.props.skipWrapper ?
      meat :
      <div id="explore" className="exploreWrapper">
        <h5 className="details-title">Explore</h5>
        {meat}
      </div>

    var exhib_bones = <div className="exhibitionWrapper">
        <h5 className="details-title">Exhibitions</h5>
        {exhibition_wrap}
      </div>

    return <div>
      {explore && explore.length > 0 && bones}
      {significantExhibitions && significantExhibitions.length > 0 && exhib_bones}
    </div>
  },

  build(json) {
    if(!json.id) json.id = this.props.id
    var trackRelatedClick = this.trackRelatedContentInteraction.bind(this, json)
    if(json.link.match('vimeo.com')) json.type = 'video'
    var template = this.templates[json.type] || this.templates.default

    return <div onClick={trackRelatedClick} key={json.link || json.title}>
      {template.bind(this)(json, this.props.id, this.props.highlights, trackRelatedClick)}
    </div>
  },

  trackRelatedContentInteraction(json, event) {
    // track clicks on related content via more.artsmia.org fort objects on G311 and 355
    if(['G311', 'G355'].indexOf(this.props.art.room) > -1) {
      event.preventDefault()

      // note: outbound link tracking only accepts 'label'
      ga.outboundLink({
        category: 'more.artsmia.org related content click',
        action: 'clicked',
        label: json.type,
        value: `${json.id} - ${json.link}`,
      }, function() {
        // window.location = json.link
        json.type == 'audio' || window.open(json.link, '_blank')
      })
    }
  },

  templates: {
    audio: (json, id, _, track) => <div className="audioClip">
      <audio style={{maxWidth: '100%'}} src={json.link.replace('http:', 'https:')} controls onPlay={track}></audio>
      <span>Audio Clip</span>
    </div>,
    newsflash: (json) => <div className="newsflash" style={{backgroundImage: `url(https://newsflash.dx.artsmia.org${json.image})`}}>
      <div className="overlay">
      <a href={json.link}>{json.title}<br/><sub>Read more.</sub></a>
      <i className="material-icons">launch</i>
      </div>
    </div>,
    artstory: (json, id, highlight) => <div className={cx("artstory", {"block-highlight": highlight && highlight["related:artstories"]})} style={{backgroundImage: `url(${imageCDN(id)})`, ...artstoryStampStyle}}>
      <div className="overlay">
        <a href={json.link}>ArtStories<br/><sub>Zoom in.</sub></a>
        <i className="material-icons">launch</i>
      </div>
    </div>,
    "adopt-a-painting": (json, id, highlights) => {
      var highlight = highlights && highlights["related:adopt-a-painting"]
      var highlight = highlight ? JSON.parse(highlight[0]) : null
      if(!(highlight || window.location && window.location.pathname.match(/related.*adopt/))) return <span />

      if(json.adopted === "1") {
        return <div className="adopt-ptg" style={{clear:'both'}}>
          <h3>This painting has been adopted.</h3>
          <a href="/info/adopt-a-painting">Learn more about adopting a painting. <i className="material-icons">launch</i></a>
          {highlight && <div>It needed adoption because… <blockquote><Markdown>{highlight.description}</Markdown></blockquote></div>}
        </div>
      } else {
        return <div className="adopt-ptg">
          <div style={{width: "100%"}}>
          <h3>Adopt-a-Painting</h3>
          <p>Cost <span className="cost">{json.cost}</span></p>
          <Markdown>{highlight ? highlight.description : json.description}</Markdown>
          <a href="/info/adopt-a-painting">Learn how to adopt this painting. <i className="material-icons">launch</i></a>
          </div>
        </div>
      }
    },
    default: (json, id, highlights) => {
      var miaStoryMatches = highlights && highlights['related:stories'] && highlights['related:stories'].filter(h => { var h = JSON.parse(h); return json.title == h.title.replace(/<\/?em>/g, '') })
      var defaultStyle = {backgroundColor: "rgb(35,35,35)"}

      return <div className="explore-content" style={defaultStyle}>
        <div className={cx("overlay", {"block-highlight": miaStoryMatches && miaStoryMatches.length > 0})}>
          <a href={json.link}>{json.title}<br/><sub>Explore more.</sub></a>
          <i className="material-icons">launch</i>
        </div>
      </div>
    },
    "exhibition": (json, id, highlights) => {
      var otherArtCount = json.objectIds ? json.objectIds.length-1 : '(x)'

      return <ul className="exhibitions" style={{clear: "both"}}>
        <li><h4><Link to="exhibition" params={{id: json.id}}>{json.title}</Link></h4> {json.date}</li>
      </ul>
    },
    "3d": (json, id) => {
      var style = {
        backgroundColor: "rgb(35,35,35)",
        backgroundImage: `url(${json.thumb})`,
        ...artstoryStampStyle
      }

      return <div className="explore-content 3d" style={style}>
        <div className="overlay">
          <a href={json.link}><br/>👓<sub>Explore in 3D</sub></a>
          <i className="material-icons">launch</i>
        </div>
      </div>
    },
    "video": (json, id) => {
      var iframe = <iframe src={`https://player.vimeo.com/video/${json.link.match(/\d+/)[0]}`} frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

      return iframe
    }
  },
})

module.exports = ArtworkRelatedContent
