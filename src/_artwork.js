var React = require('react')
var {Link} = require('react-router')
var toSlug = require('speakingurl')
var classnames = require('classnames')

var ArtworkImage = require('./artwork-image')
var Peek = require('./peek')
var imageCDN = require('./image-cdn')

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
    var title = <h1 itemProp="name">{art.title}, <span className="dated">{art.dated}</span></h1>

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

    return <div onDoubleClick={this.handleDoubleClick}>
      <p className="tombstone"><Peek facet="medium" tag="span">{art.medium}</Peek></p>
      {this.state.showLabels && <CopyableLabel art={art} onClose={this.handleDoubleClick} />}
      <p className="gifted"><Peek facet="creditline" tag="span">{art.creditline}</Peek> {art.accession_number}</p>
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

    var {join, formatDates, titlecase} = this

    var hasValidArtist = art.artist !== "" && !art.artist.match(/Unknown/i)
    var [facet, creator] = Creator.getFacetAndValue(art)
    if(facet == 'country' || facet == undefined) creator = undefined

    var title = hasValidArtist ? <i>{art.title}</i> : art.title

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
              formatDates(art.life_date)
            ] ||
            [creator, art.country, art.continent]
        )}</p>
        <p>
          {title},&nbsp;{join([formatDates(art.dated), titlecase(art.medium)])}
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

  formatDates(dateString) {
    var dates = dateString.replace(/^[A-Za-z ,\(\)]+/, '').split(/\s*-\s*/)
    if(dates.length > 1) {
      var [start, end] = dates
      if(start.substr(0, 2) === end.substr(0, 2)) return start+"–"+end.substr(2)
      return start+"–"+end
    }
    return dates.join("–")
  },

  titlecase(string) {
    return string[0].toUpperCase() + string.substr(1).toLowerCase()
  },
})

var LinkBar = React.createClass({
  getDefaultProps() {
    return {
      actions: {
        like: {
          enabled: false,
          icon: 'favorite_border',
        },
        download: {
          enabled: true,
          icon: 'file_download',
        },
        print: {
          enabled: true,
        },
        share: {
          enabled: true,
          icon: 'share',
        },
      }
    }
  },

  getInitialState() {
    return {
      showShare: false,
    }
  },

  render() {
    var {art} = this.props

    var actions = Object.keys(this.props.actions)
    .map(key => {
      this.props.actions[key].key = key
      return this.props.actions[key]
    }, [])
    .filter(action => action.enabled)

    return <div>
      <div className="link-bar">
        {actions.map(action => {
          var key = action.key
          var handler = eval(`_this.handle${key[0].toUpperCase() + key.substr(1)}`) // TODO alert alert warning warning (shouldn't have to reference _this, sketchy code)
          var icon = <i key={key} className="material-icons" onClick={handler}>{action.icon || action.key}</i>
          return (key == 'download') ?
            <a href={imageCDN(art.id)} download style={{padding: 0}}>{icon}</a> :
            icon
        })}
      </div>
      {this.state.showShare && this.showShare()}
      <div className="clear"></div>
      <div className="back-button">{this.props.link && <Link to="artwork" params={{id: art.id}}>View Details <i className="material-icons">arrow_forward</i></Link>}</div>
    </div>
  },

  getUrl() {
    return 'http://collections.artsmia.org'+this.context.router.getCurrentPath()
  },

  handleShare() {
    var {art} = this.props

    this.setState({showShare: !this.state.showShare})
  },

  showShare() {
    var {art} = this.props

    var facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(this.getUrl())}`
    var twitterURL = `https://twitter.com/intent/tweet?url=${encodeURI(this.getUrl())}`
    var emailURL = `mailto:?subject=${art.title}&body=${encodeURI(this.getUrl())}`

    return <div className="share">
      <div className="social"><a title="Share via email" href={emailURL} target="_blank">
        <img src="https://simpleicons.org/icons/email.svg" />
      </a></div>
      <div className="social"><a title="Share on Facebook" href={facebookURL} target="_blank">
        <img src="http://cdn.rawgit.com/danleech/simple-icons/gh-pages/icons/facebook.svg" />
      </a></div>
      <div className="social"><a title="Share on Twitter" href={twitterURL} target="_blank">
        <img src="http://cdn.rawgit.com/danleech/simple-icons/gh-pages/icons/twitter.svg" />
      </a></div>
    </div>
  },

  handlePrint() {
    window.print()
  },

  handleDownload() {
    console.info('TODO')
  },

  handleLike() {
    console.info('TODO')
  },
})
LinkBar.contextTypes = {
  router: React.PropTypes.func,
}

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
