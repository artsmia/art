var React = require('react')
var {Link} = require('react-router')

var ArtworkImage = require('./artwork-image')
var Peek = require('./peek')

var Title = React.createClass({
  render() {
    var {art, link} = this.props
    var title = <h1 itemProp="name">{art.title}</h1>

    return link ? 
      <Link to="artwork" params={{id: art.id}}>{title}</Link> :
      title
  },
})

var Tombstone = React.createClass({
  render() {
    var {art} = this.props

    return <div className='tombstone'>
      <Peek facet="medium" tag="span">{art.medium}</Peek><br />
      {art.dimension}<br/>
      <Peek facet="creditline" tag="span">{art.creditline}</Peek>
      {art.accession_number}
    </div>
  },
})

var LinkBar = React.createClass({
  render() {
    var {art} = this.props

    return <div className="link-bar">
      <i className="material-icons">favorite_border</i>
      <i className="material-icons">launch</i>
      {this.props.link && <Link to="artwork" params={{id: art.id}}>View Details &rarr;</Link>}
    </div>
  },
})

var Figure = React.createClass({
  render() {
    var {art, ...figureProps} = this.props
    var id = art.id

    return <figure {...figureProps}
      itemScope itemType="http://schema.org/VisualArtwork">
      <link itemProp="url" href={`/art/${id}`} />
      <ArtworkImage art={art} id={id} lazyLoad={!this.context.universal} className="artwork-image" />
      <figcaption>
        {this.props.children}
      </figcaption>
    </figure>
  },
})
Figure.contextTypes = {
  universal: React.PropTypes.bool,
}

var Creator = React.createClass({
  render() {
    var wrapper = this.props.wrapper || React.DOM.h5
    var {artist, culture, country} = this.props.art

    return <wrapper itemProp="creator" itemScope itemType="http://schema.org/Person">
      <span>{
        !(artist == '' || artist.match(/unknown/i))
          && <Peek microdata={true} facet="artist">{artist}</Peek>
        || !!culture
          && <Peek microdata={true} facet="culture">{culture.replace(/ culture/i, '')}</Peek>
        || !!country
          && <span>Unknown artist, <Peek microdata={true} facet="country" tag="span">{country}</Peek></span>
      }</span>
    </wrapper>
  },
})

module.exports = {
  Title,
  Tombstone,
  LinkBar,
  Figure,
  Creator
}
