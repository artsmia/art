var React = require('react')
var rest = require('rest')

var Markdown = require('./markdown')
var imageCDN = require('./image-cdn')
var {relatedInfo} = require('./endpoints')

var artstoryStampStyle = {
  backgroundPosition: 'center center',
  backgroundSize: 'contain',
}

var ArtworkRelatedContent = React.createClass({
  statics: {
    fetchData: (params) => {
      return rest(relatedInfo(params.id))
      .then(r => JSON.parse(r.entity))
      .catch(err => [])
    },
  },

  render() {
    var {links} = this.props

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

  build(link) {
    return <div key={link.link}>
      {(this.templates[link.type] || this.templates.default)(link, this.props.id, this.props.highlights)}
    </div>
  },

  templates: {
    audio: (link) => <div className="audioClip">
      <audio style={{maxWidth: '100%'}} src={link.link} controls></audio>
      <a href={link.link}>Audio Clip<br/><sub>Listen.</sub></a>
    </div>,
    /*newsflash: (link) => <div className="newsflash" style={{backgroundImage: `url(http://newsflash.dx.artsmia.org${link.image})`}}>
      <div className="overlay">
      <a href={link.link}>{link.title}<br/><sub>Read more.</sub></a>
      <i className="material-icons">launch</i>
      </div>
    </div>,*/
    newsflash: (link) => <span />,
    artstory: (link, id) => <div className="artstory" style={{backgroundImage: `url(${imageCDN(id)})`, ...artstoryStampStyle}}>
      <div className="overlay">
      <a href={link.link}>ArtStories<br/><sub>Zoom in.</sub></a>
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
    default: (link) => <div className="explore-content" style={{backgroundColor: "rgb(35,35,35)"}}>
      <div className="overlay">
      <a href={link.link}>{link.title}<br/><sub>Explore more.</sub></a>
      <i className="material-icons">launch</i>
      </div>
    </div>,
  },
})

module.exports = ArtworkRelatedContent
