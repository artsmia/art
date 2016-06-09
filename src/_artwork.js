var React = require('react')
var {Link} = require('react-router')
var toSlug = require('speakingurl')
var classnames = require('classnames')

var ArtworkImage = require('./artwork-image')
var Peek = require('./peek')
var imageCDN = require('./image-cdn')
var highlighter = require('./highlighter')
var Markdown = require('./markdown')

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
    var {art, link, highlights} = this.props
    var title = <Markdown tag="span">{highlighter(art, highlights, "title")}</Markdown>
    var title = <h1 itemProp="name">{title}, <span className="dated">{art.dated}</span></h1>

    return <ConditionalLinkWrapper {...this.props}>
      {title}
    </ConditionalLinkWrapper>
  },
})

var Tombstone = React.createClass({
  getInitialState() {
    return {
      showLabels: false,
      highlightAccessionNumber: false,
    }
  },

  render() {
    var {art, highlightAccessionNumber} = this.props
    var highlight = highlighter.bind(null, art, this.props.highlights)

    var accessionNumber = this.props.highlighter ?
      this.props.highlighter(art.accession_number, highlightAccessionNumber) :
      art.accession_number

    return <div onDoubleClick={this.handleDoubleClick}>
      <p className="tombstone">
        <Peek facet="medium" tag="span" highlightedValue={highlight('medium')}>{art.medium}</Peek>
      </p>
      {this.state.showLabels && <CopyableLabel art={art} onClose={this.handleDoubleClick} />}
      <p className="gifted">
        <Peek facet="creditline" tag="span" highlightedValue={highlight('creditline')}>{art.creditline}</Peek> {accessionNumber}
      </p>
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

    var title = this.state.useQuotes ? `“${art.title}”` : <i>{art.title}</i>
    if(!hasValidArtist) title = art.title

    // Artist name [if known], Country of origin, birth/death dates,
    // or
    // Self-designation of people/tribe, location (country +/- continent)
    // Title of object [italicized if simply nondescriptive, like Table], creation date, media,
    // Source of purchase funds, accession number [+ © or ARS info]
    return <div style={style}>
      <ClickToSelect ref="click">
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

      <div style={{opacity: '0.5'}}>
        <label for="useQuotes" onDoubleClick={(e) => {e.stopPropagation(); e.preventDefault()}}>
          <input type="checkbox"
            onChange={this.toggleQuotes}
            checked={this.state.useQuotes}
          />
          use quotes
        </label>
        <button onClick={this.props.onClose} style={{color: '#111', float: 'right'}}>(close)</button>
      </div>
    </div>
  },

  getInitialState() {
    return {
      useQuotes: false,
    }
  },

  toggleQuotes(event) {
    event.stopPropagation()
    const useQuotes = this.state ? !this.state.useQuotes : true
    this.setState({useQuotes})
  },

  join(fields) {
    return fields.filter(f => !!f).join(', ')
  },

  formatDates(dateString) {
    var dates = dateString.replace(/^[A-Za-z \.,\(\)]+/, '').split(/\s*-\s*/)
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

  componentDidMount() {
    // auto-select the text instead of requiring a click
    var domNode = this.refs.click && React.findDOMNode(this.refs.click)
    if(domNode) domNode.click()
  },
})

// check if an image exists on our cloudfront distribution,
// and if not, fall back to loading it from the API
var testCloudfrontImage = (art, callback) => {
  var cdnUrl = imageCDN(art.id, art.restricted ? 400 : 800)

  if(typeof document == 'undefined') {
    return cdnUrl
  }

  var i = document.createElement('img')
  i.onload = () => callback(cdnUrl)
  i.onerror = () => callback(`http://api.artsmia.org/images/${art.id}/${art.restricted ? '400/medium.jpg' : '800/large.jpg'}`)
  i.src = cdnUrl
}

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
    // don't show 'download' for art with an invalid image
    .filter(action => !(action.key == 'download' && art.image == 'invalid'))

    return <div>
      <div className="link-bar">
        {actions
        .map(action => {
          var key = action.key
          var handler = eval(`_this.handle${key[0].toUpperCase() + key.substr(1)}`) // TODO alert alert warning warning (shouldn't have to reference _this, sketchy code)

          var options = {
            key: key,
            className: "material-icons",
            onClick: handler,
          }
          if(key == 'download') {
            options.download = ''
            if(this.state.resolvedImageDownloadUrl) {
              options.href = this.state.resolvedImageDownloadUrl
            } else {
              testCloudfrontImage(art, url => { this.setState({resolvedImageDownloadUrl: url})})
            }
          }
          var content = action.icon || action.key

          return (key == 'download') ?
            <a {...options}>{content}</a> :
            <i {...options}>{content}</i>
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
    var {art} = this.props
    var {id} = art
    if(process.env.NODE_ENV == 'production') {
      require('react-ga').event({
        category: 'Artwork',
        action: 'Image Download',
        label: art.title,
        value: parseInt(id)
      })
    } else {
       console.info('ga.event', 'downloaded', id)
    }
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
    var [facet, value, highlightedValue] = Creator.getFacetAndValue(this.props.art, this.props.highlights)
    var creatorPeek = (facet == 'artist' || facet == 'culture')
      && <Peek microdata={true} facet={facet} {...{highlightedValue}}>{value}</Peek>
      || facet == 'country'
      && <span>Unknown artist, <Peek microdata={true} facet="country" tag="span" showIcon={this.props.showIcon} {...{highlightedValue}}>{value}</Peek></span>

    return <Wrapper itemProp="creator" itemScope itemType="http://schema.org/Person">
      {this.props.peek ? creatorPeek : (highlightedValue ? <Markdown>{highlightedValue}</Markdown> : value)}
    </Wrapper>
  },

  getDefaultProps() {
    return {peek: true}
  },
})
Creator.getFacetAndValue = (art, highlights) => {
  var {artist, culture, country} = art
  var highlight = highlighter.bind(null, art, highlights)

  return !(artist == '' || artist.match(/^unknown/i)) &&
    ['artist', art.artist.replace(/^([^;]+):/, ''), highlight('artist').replace(/^([^;]+):/, '')]
  || !!culture
    && ['culture', art.culture.replace(/ culture/i, ''), highlight('culture').replace(/ culture/i, '')]
  || !!country
    && ['country', art.country, highlight('country')]
  || [undefined, undefined]
}

var slug = (art) => {
  var creator = Creator.getFacetAndValue(art)[1]
  var string = [art.title.replace(/<[^ ]+?>/g, ''), creator && creator.split(';')[0]]
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
