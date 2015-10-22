var React = require('react')
var {Link} = require('react-router')
var toSlug = require('speakingurl')
var classnames = require('classnames')

var ArtworkImage = require('./artwork-image')
var Peek = require('./peek')

var ConditionalLinkWrapper = React.createClass({
  render() {
    var {art, link} = this.props

    return link ? 
      <Link to="artwork" params={{id: art.id}}>{this.props.children}</Link> :
      this.props.children
  }
})

var Title = React.createClass({
  render() {
    var {art, link} = this.props
    var title = <h1 itemProp="name">{art.title}</h1>

    return <ConditionalLinkWrapper {...this.props}>
      {title}
    </ConditionalLinkWrapper>
  },
})

var Tombstone = React.createClass({
  getInitialState() {
    return {
      showLabels: false,
    }
  },

  render() {
    var {art} = this.props

    return <div className='tombstone' onDoubleClick={this.handleDoubleClick}>
      <Peek facet="medium" tag="span">{art.medium}</Peek><br />
      {art.dimension}<br/>
      <Peek facet="creditline" tag="span">{art.creditline}</Peek>
      {art.accession_number}

      {this.state.showLabels && <CopyableLabel art={art} onClose={this.handleDoubleClick} />}
    </div>
  },

  handleDoubleClick() {
    // show a copy-able tombstone/label in different formats
    this.setState({showLabels: !this.state.showLabels})
  }
})

var ClickToSelect = require('react-click-to-select')

var CopyableLabel = React.createClass({
  render() {
    var {art} = this.props

    var style = {
      border: '1px solid red',
      position: 'absolute',
      background: 'white',
      padding: '0.25em',
    }

    var join = this.join

    var hasValidArtist = art.artist !== "" && !art.artist.match(/Unknown/i)
    var [facet, creator] = Creator.getFacetAndValue(art)
    if(facet == 'country' || facet == undefined) creator = 'Unknown artist'

    // Artist name [if known], Country of origin, birth/death dates,
    // or
    // Self-designation of people/tribe, location (country +/- continent)
    // Title of object [italicized if simply nondescriptive, like Table], creation date, media, 
    // Source of purchase funds, accession number [+ © or ARS info]
    return <div style={style}>
      <ClickToSelect>
        <p>{join(hasValidArtist &&
            [
              creator,
              art.country,
              art.life_date.replace(/[A-Za-z ,]+/, '')
            ] ||
            [creator, art.country, art.continent]
        )}</p>
        <p>
          <i>{art.title}</i>,&nbsp;{join([art.dated, art.medium])}
        </p>
        <p>
          {join([
            art.creditline,
            art.accession_number,
            decodeURIComponent(art.image_copyright),
          ])}
        </p>
      </ClickToSelect>

      <button onClick={this.props.onClose}>(close)</button>
    </div>
  },

  join(fields) {
    return fields.filter(f => !!f).join(', ')
  },
})

var LinkBar = React.createClass({
  render() {
    var {art} = this.props

    return <div>
      <div className="link-bar">
        <i className="material-icons">favorite_border</i>
        <i className="material-icons">file_download</i>
        <i className="material-icons">send</i>
      </div>
      <div className="clear"></div>
      <div className="back-button">{this.props.link && <Link to="artwork" params={{id: art.id}}>View Details <i className="material-icons">arrow_forward</i></Link>}</div>
    </div>
  },
})

var Figure = React.createClass({
  render() {
    var {art, link, className, ...figureProps} = this.props
    var id = art.id
    var classes = classnames(className, {validImage: art.image === 'valid' && art.image_width > 0})

    return <figure {...figureProps} className={classes}
      itemScope itemType="http://schema.org/VisualArtwork">
      <link itemProp="url" href={`/art/${id}`} />
      <ConditionalLinkWrapper art={art} link={link}>
        <ArtworkImage art={art} id={id} lazyLoad={false} className="artwork-image" />
      </ConditionalLinkWrapper>
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
    var Wrapper = this.props.wrapper || "h5"
    var [facet, value] = Creator.getFacetAndValue(this.props.art)
    var creatorPeek = (facet == 'artist' || facet == 'culture')
      && <Peek microdata={true} facet={facet}>{value}</Peek>
      || facet == 'country'
      && <span>Unknown artist, <Peek microdata={true} facet="country" tag="span" showIcon={this.props.showIcon}>{value}</Peek></span>

    return <Wrapper itemProp="creator" itemScope itemType="http://schema.org/Person">
      {this.props.peek ? creatorPeek : value}
    </Wrapper>
  },

  getDefaultProps() {
    return {peek: true}
  },
})
Creator.getFacetAndValue = (art) => {
  var {artist, culture, country} = art

  return !(artist == '' || artist.match(/unknown/i)) &&
    ['artist', artist]
  || !!culture
    && ['culture', culture.replace(/ culture/i, '')]
  || !!country
    && ['country', country]
  || [undefined, undefined]
}

var slug = (art) => {
  var creator = Creator.getFacetAndValue(art)[1]
  var string = [art.title, creator && creator.split(';')[0]]
    .filter(e => e)
    .join(' ')
    .replace(/\(.*\)/, '')
    .replace('ō', 'o')
  return toSlug(string)
}

module.exports = {
  Title,
  Tombstone,
  LinkBar,
  Figure,
  Creator,
  slug
}
