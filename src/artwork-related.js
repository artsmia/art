var React = require('react')
var rest = require('rest')
var cx = require('classnames')
var {Link} = require('react-router')

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
      relateds.push(JSON.parse(art[key]))
      return relateds
    }, [])

    var explore = links.filter(link => link.type !== "exhibition")
    var exhibitions = links.filter(link => link.type == "exhibition")
    // only show exhibitions with more than a single object
    // and for now, also those tagged `rotation`
    var significantExhibitions = exhibitions.filter(ex => {
      return ex.objectIds.length > 1 && ex.rotation == "true"
    })

    var meat = <div className="explore">
      {explore.map(this.build)}
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

      var exhib_bones = this.props.skipWrapper ?
        significantExhibitions :
        <div className="exhibitionWrapper">
          <h5 className="details-title">Exhibitions</h5>
          {exhibition_wrap}
        </div>

    return <div>
      {explore && explore.length > 0 && bones}
      {significantExhibitions && significantExhibitions.length > 0 && exhib_bones}
    </div>
  },

  build(json) {
    return <div key={json.link || json.title}>
      {(this.templates[json.type] || this.templates.default)(json, this.props.id, this.props.highlights)}
    </div>
  },

  templates: {
    audio: (json) => <div className="audioClip">
      <audio style={{maxWidth: '100%'}} src={json.link} controls></audio>
      <a href={json.link}>Audio Clip<br/><sub>Listen.</sub></a>
    </div>,
    newsflash: (json) => <div className="newsflash" style={{backgroundImage: `url(http://newsflash.dx.artsmia.org${json.image})`}}>
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

      return <div className="explore-content" style={{backgroundColor: "rgb(35,35,35)"}}>
        <div className={cx("overlay", {"block-highlight": miaStoryMatches && miaStoryMatches.length > 0})}>
          <a href={json.link}>{json.title}<br/><sub>Explore more.</sub></a>
          <i className="material-icons">launch</i>
        </div>
      </div>
    },
    "exhibition": (json, id, highlights) => {
      var otherArtCount = json.objectIds ? json.objectIds.length-1 : '(x)'

      return <div className="exhibition" style={{clear: "both"}}>
        <p>This was shown in the exhibition <span className="exh_title"><Link to="exhibition" params={{id: json.id}}>{json.title}</Link></span> with {otherArtCount} other objects. {json.description}</p>
      </div>
    },
    olddefault: (link) => <div className="explore-content" style={{backgroundColor: "rgb(35,35,35)"}}>
      <div className="overlay">
        <a href={link.link}>{link.title}<br/><sub>Explore more.</sub></a>
        <i className="material-icons">launch</i>
      </div>
    </div>,
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
    }
  },
})

module.exports = ArtworkRelatedContent
