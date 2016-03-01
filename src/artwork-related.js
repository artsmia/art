var React = require('react')
var rest = require('rest')
var cx = require('classnames')

var Markdown = require('./markdown')
var imageCDN = require('./image-cdn')
var {relatedInfo} = require('./endpoints')

var artstoryStampStyle = {
  backgroundPosition: 'center center',
  backgroundSize: 'contain',
}

var ArtworkRelatedContent = React.createClass({
  render() {
    // gather any `related:` info on the artwork into `links[]`
    var {art} = this.props
    var links = Object.keys(art).filter(key => key.match('related:'))
    .reduce((relateds, key) => {
      relateds.push(JSON.parse(art[key]))
      return relateds
    }, [])

    var meat = <div className="explore">
      {links.map(this.build)}
    </div>

    var bones = this.props.skipWrapper ?
      meat :
      <div className="exploreWrapper">
        <h5 className="details-title">Explore</h5>
        {meat}
      </div>

    return links && links.length > 0 && bones
  },

  build(json) {
    return <div key={json.link}>
      {(this.templates[json.type] || this.templates.default)(json, this.props.id, this.props.highlights)}
    </div>
  },

  templates: {
    audio: (json) => <div className="audioClip">
      <audio style={{maxWidth: '100%'}} src={json.link} controls></audio>
      <a href={json.link}>Audio Clip<br/><sub>Listen.</sub></a>
    </div>,
    /*newsflash: (json) => <div className="newsflash" style={{backgroundImage: `url(http://newsflash.dx.artsmia.org${json.image})`}}>
      <div className="overlay">
      <a href={json.link}>{json.title}<br/><sub>Read more.</sub></a>
      <i className="material-icons">launch</i>
      </div>
    </div>,*/
    newsflash: (json) => <span />,
    artstory: (json, id, highlight) => <div className={cx("artstory", {"block-highlight": highlight && highlight["related:artstories"]})} style={{backgroundImage: `url(${imageCDN(id)})`, ...artstoryStampStyle}}>
      <div className="overlay">
        <a href={json.link}>ArtStories<br/><sub>Zoom in.</sub></a>
        <i className="material-icons">launch</i>
      </div>
    </div>,
    "adopt-a-painting": (json, id, highlights) => {
      var highlight = highlights && highlights["related:adopt-a-painting"]
      var highlight = highlight ? JSON.parse(highlight[0]) : null

      if(json.adopted === "1") {
        return <div className="adopt-ptg" style={{clear:'both'}}>
          <h3>This painting has been adopted.</h3>
          <a href="/info/adopt-a-painting">Learn more about adopting a painting. <i className="material-icons">launch</i></a>
          {highlight && <blockquote style={{marginTop: '1em'}}><Markdown>{highlight.description}</Markdown></blockquote>}
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
    "exhibition": () => <span />,
    "exhibitions": () => <span />,
    default: (json, id, highlights) => {
      var miaStoryMatches = highlights && highlights['related:stories'] && highlights['related:stories'].filter(h => { var h = JSON.parse(h); return json.title == h.title.replace(/<\/?em>/g, '') })

      return <div className="explore-content" style={{backgroundColor: "rgb(35,35,35)"}}>
        <div className={cx("overlay", {"block-highlight": miaStoryMatches && miaStoryMatches.length > 0})}>
          <a href={json.link}>{json.title}<br/><sub>Explore more.</sub></a>
          <i className="material-icons">launch</i>
        </div>
      </div>
    },
  },
})

module.exports = ArtworkRelatedContent
