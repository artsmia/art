var React = require('react')
var Router = require('react-router')
var {Link} = Router
var rest = require('rest')
var humanizeNumber = require('humanize-number')
var Helmet = require('react-helmet')
var cx = require('classnames')

var ArtworkImage = require('./artwork-image')
var Markdown = require('./markdown')
var ArtworkPreview = require('./artwork-preview')
var ArtworkDetails = require('./artwork-details')
var _Artwork = require('./_artwork')
var Image = require('./image')
var imageCDN = require('./image-cdn')
var SEARCH = require('./endpoints').search
var ArtworkRelatedContent = require('./artwork-related')

var Sticky = require('react-sticky')

var Artwork = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: {
      artwork: (params, existingData) => {
        if(existingData && existingData.id && existingData.id == params.id) return Promise.resolve(existingData)
        return rest(`${SEARCH}/id/`+params.id)
        .then((r) => JSON.parse(r.entity))
        .then(art => {
          art.slug = _Artwork.slug(art)
          return art
        })
      },
    },

    checkRoute: (params, callback) => {
      var existingArt = window.__DATA__ && window.__DATA__.artwork
      return Artwork.fetchData.artwork(params, existingArt).then(art => {
        window.__DATA__ = {artwork: art}
        if(art.slug !== params.slug) {
          params.slug = art.slug
          return callback('mismatched slug', art)
        }
        callback(false, art)
      })
    },

    willTransitionTo: function (transition, params, query, callback) {
      Artwork.checkRoute(params, (err) => {
        if(err) transition.redirect('artworkSlug', params)
      })
      .then(callback)
    },

    pageMetadata(art, prependTitle='') {
      var pageTitle = prependTitle + [
        art.title.replace(/<[^ ]+?>/g, '"'),
        _Artwork.Creator.getFacetAndValue(art)[1]
      ].filter(e => e).join(', ')
      var imageUrl = imageCDN(art.id)
      var canonicalURL = `http://collections.artsmia.org/art/${art.id}/${art.slug}`

      return <Helmet
      title={pageTitle}
      meta={[
        {property: "og:title", content: pageTitle + ' ^ Minneapolis Institute of Art'},
        {property: "og:description", content: art.text},
        {property: "og:image", content: imageUrl},
        {property: "og:url", content: canonicalURL},
        {property: "twitter:card", content: "summary_large_image"},
        {property: "twitter:site", content: "@artsmia"},
        {property: "robots", content: art.accession_number.match(/^L/i) ? 'noindex' : 'all'},
      ]}
      link={[
        {"rel": "canonical", "href": canonicalURL},
      ]}
      />
    },
  },

  render() {
    var art = this.state.art
    var id = this.props.id || this.state.id
    const highlights = this.props.highlights
    var stickyMapStyle = this.context.universal ? {position: 'fixed'} : {}
    var {smallViewport} = this.context

    var pageTitle = [
      art.title.replace(/<[^ ]+?>/g, '"'),
      _Artwork.Creator.getFacetAndValue(art)[1]
    ].filter(e => e).join(', ')
    var imageUrl = imageCDN(id)
    var canonicalURL = `https://collections.artsmia.org/art/${art.id}/${art.slug}`

    var image = <Image art={art}
      style={{width: 400, height: 400, maxWidth: '100%'}}
      ignoreStyle={true} />

    var aspectRatio = art.image_width/art.image_height
    var mapHeight = art.image == "valid" ?
      Math.max(40, Math.min(65, 1/aspectRatio*80)) :
      20
    if(smallViewport && this.state.show3d) mapHeight = 67

    var showMoreIcon = Object.keys(art).filter(key => key.match(/related:/) && !key.match(/related:exhibitions/)).length > 0 &&
      !this.state.fullscreenImage
    var toggleRelated = this.state.smallViewportShowInfoOrRelatedContent
    var infoRelatedToggleStyles = {
      position: 'absolute',
      zIndex: '10000',
      right: '7px',
      bottom: '7px',
      color: '#232323',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '1em',
      lineHeight: '0.8em',
    }
    var exploreIcon = showMoreIcon &&
      <a href="#" onClick={this.toggleInfoAndRelatedContent} style={infoRelatedToggleStyles}>
        {!toggleRelated ?
          <img src="/images/more-icon.svg" style={{width: '3em', paddingTop: 7}}/> :
          <i className="control material-icons">info</i>}
      </a>
    var relatedContent = <ArtworkRelatedContent id={id} art={art} />

    var mapStyle = smallViewport ?
      {width: '100%', display: 'inline-block', height: mapHeight+'vh'} :
      stickyMapStyle

    var {zoomLoaded} = this.state
    var zoomLoadedSuccessfully = zoomLoaded && zoomLoaded !== 'error'

    var map = <div ref='map' id='map' style={mapStyle}>
      {this.state.has3d && <SketchfabEmbed model={this.state.has3d} show={this.state.show3d} />}
      {zoomLoadedSuccessfully || (art.image == 'valid' && art.rights !== 'Permission Denied') && <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', WebkitTransform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center'}}>
        {image}
        {art.image_copyright && <p style={{fontSize: '0.8em'}}>{decodeURIComponent(art.image_copyright)}</p>}
      </div> || <NoImagePlaceholder art={art} />}
      {this.imageStatus()}
      {smallViewport && showMoreIcon && exploreIcon}
    </div>

    var info = <div className='info'>
      {this.props.children || <div>
        <ArtworkPreview art={art} showLink={false} showDuplicateDetails={true} />
        {this.state.has3d && <div className="images">
          <p onClick={this.toggle3d}>{this.state.show3d ? 'show high-res image' : 'show 3D model'}</p> 
        </div>}
        <div className="back-button"><a href="#" onClick={() => history.go(-1)}><i className="material-icons">arrow_back</i> back</a></div>
        {smallViewport || relatedContent}
        <div>
          <h5 className='details-title'>Details</h5>
          <ArtworkDetails art={art} show3d={this.state.show3d} />
        </div>
      </div>}
    </div>

    var smallViewportWithTabbedInfoAndRelated = <div>
      <div style={{display: !!toggleRelated ? 'none' : 'block'}}>{info}</div>
      <div style={{display: !toggleRelated ? 'none' : 'block'}}><div className='info'>{relatedContent}</div></div>
    </div>
    // TODO: should the related content be in both the info and more-specific view?
    // react can't gradt an <audio> tag while playing, so showing it in both places makes the playback weird.
    // code below in case this needs to be revisited
    // {(smallViewport && toggleRelated) || relatedContent} <- goes into info div
    // var smallViewportWithTabbedInfoAndRelated = !toggleRelated ? 
    //   info :
    //   <div className="info">{relatedContent}</div>

    var content
    if(smallViewport) {
      content = <div>
        {map}
        {smallViewportWithTabbedInfoAndRelated}
      </div>
    } else {
      content = <div>
        {info}

        <Sticky
          stickyStyle={{position: 'fixed', height: '100%', width: '65%', top: 0, transform: 'translate3d(0px,0px,0px)'}}
          onStickyStateChange={this.resizeMap}>
          {map}
        </Sticky>
      </div>
    }

    return <div className={cx('artwork', {smallviewport: smallViewport})}>
      {content}
      {Artwork.pageMetadata(art)}
    </div>
  },

  toggle3d() {
    var nextShow3d = !this.state.show3d
    this.setState({show3d: nextShow3d})
    if(!nextShow3d) {
      if(!this.state.zoomLoaded) this.loadZoom()
    }
    if(nextShow3d && this.state.zoomLoaded) {
    }
  },

  getInitialState() {
    var art = this.props.data.artwork
    art.id = this.props.id || art.id.replace('http://api.artsmia.org/objects/', '')

    var has3Dmodel = art["related:3dmodels"] && art["related:3dmodels"][0]
    var navigatedFrom3dModelSearch = window &&
      window.lastSearchedTerms && 
      window.lastSearchedTerms.indexOf('related:3dmodels') >= 0

    return {
      art: art,
      id: art.id,
      fullscreenImage: false,
      has3d: has3Dmodel,
      show3d: navigatedFrom3dModelSearch,
      smallViewportShowInfoOrRelatedContent: window && window.enteredViaMore,
    }
  },

  componentDidMount() {
    var art = this.state.art
    if(art.image === 'valid' && art.restricted != 1 && !this.isLoan() && !this.state.show3d) this.loadZoom()
    var {smallViewport} = this.context
    // push the viewport down past the header to maximize image/text on the page
    // scrolling back up reveals the menu
    // TODO: is there a way to automatically trigger safari's minimal chrome other than a user-initiated scroll event? (probably not https://stackoverflow.com/a/26884561)
    if(smallViewport && window.scrollX == 0) setTimeout(() => window.scrollTo(0, 56), 0)
  },

  componentDidUpdate() {
    if(this.context.smallViewport != this.state.lastSmallViewportSetting) {
      this.setState({lastSmallViewportSetting: this.context.smallViewport})
      if(this.map && this.tiles) {
        this.map.off()
        this.map.remove()
        this.map = undefined
        this.loadZoom()
      }
    }
  },

  loadZoom() {
    var L = require('museum-tile-layer')
    var fullscreen = require('leaflet-fullscreen')

    var art = this.state.art
    this.setState({zoomLoaded: false, zoomLoading: true})

    rest(`//tiles.dx.artsmia.org/${this.state.id}.json`)
    .then(
      response => JSON.parse(response.entity),
      rejected => {
        // TODO: log this somewhere
        this.setState({zoomLoaded: 'error'})
        return Promise.reject(new Error(`can't load tiles for ${art.id}`))
      }
    )
    .then((data) => {
      this.map = L.map(this.refs.map, {
        crs: L.CRS.Simple,
        zoomControl: false,
      })
      this.map.attributionControl.setPrefix('')
      this.map.setView([art.image_width/2, art.image_height/2], 0)
      if(!L.Browser.touch) new L.Control.Zoom({ position: 'topright' }).addTo(this.map)
      new L.Control.Fullscreen({
        position: 'topright',
        pseudoFullscreen: true,
      }).addTo(this.map)

      this.tiles = L.museumTileLayer('https://{s}.tiles.dx.artsmia.org/{id}/{z}/{x}/{y}.png', {
        attribution: art.image_copyright ? decodeURIComponent(art.image_copyright) : '',
        id: this.state.id,
        width: data.width,
        height: data.height,
        tileSize: data.tileSize || 256,
      })
      this.tiles.addTo(this.map)

      // this.tiles.fillContainer()
      this.setState({zoomLoading: false, zoomLoaded: true})
      this.map.on('fullscreenchange', () => {
        this.setState({fullscreenImage: !this.state.fullscreenImage})
        this.props.toggleAppHeader()
      })
      var zoomCount, zoomInCount, zoomOutCount, prevZoom, nowZoom;
      var zoomCount = zoomInCount = zoomOutCount = 0;
      var prevZoom = nowZoom = this.map.getZoom();
      var recentlyAutoZoomed = false;

      this.map.on('zoomstart zoomend', (event) => {
        [prevZoom, nowZoom] = [nowZoom, this.map.getZoom()]
        zoomCount += 1
        nowZoom > prevZoom ? zoomInCount += 1 : zoomOutCount += 1

        var {smallViewport} = this.context
        var isSecondZoomInAction = zoomInCount == 2
        if(smallViewport && !recentlyAutoZoomed) {
          // fullscreen the image when a user zooms twice in a row
          // leave fullscreen when they return to minZoom
          // mobile-only for now
          var reasonsToChangeFullscreen = [
            event.type == 'zoomstart' && zoomInCount == 2 && !this.map.isFullscreen(), // zooming in when not fullscreen
            event.type == 'zoomend' && nowZoom >= 3 && !this.map.isFullscreen(), // not fullscreen and zoomed in quite far
            event.type == 'zoomend' && this.map.getZoom() == this.map.getMinZoom() && this.map.isFullscreen(), // in fullscreen, zooming out to minZoom
          ]
          if(reasonsToChangeFullscreen.find(reason => reason)) { // if any of the valid reasons evaluate to true
            this.map.toggleFullscreen({pseudoFullscreen: true})
            recentlyAutoZoomed = true
            clearTimeout(this.zoomCountResetTimer)
            this.zoomCountResetTimer = setTimeout(() => { zoomCount = zoomInCount = zoomOutCount = 0; recentlyAutoZoomed = false }, 1000)
          }
        }
      })
    })
    .catch(err => this.setState({zoomLoading: false}))
  },

  resizeMap() {
    if(this.map && this.tiles) {
      this.map.invalidateSize()
      this.tiles.fitBoundsExactly()
    }
  },

  imageStatus() {
    var {art, zoomLoaded, zoomLoading} = this.state
    var copyrightAndOnViewMessage = art.room[0] == 'G' ? " (You'll have to come see it in person.)" : ''
    var loadingZoomMessage =  `
      (—Is that the best image you've got!!?
      —Nope! We're loading ${humanizeNumber(this.getPixelDifference(400))} more pixels right now.
      It can take a few seconds.)`
    var showLoadingMessage = zoomLoading && zoomLoaded === false && !this.context.universal
    var showErrorMessage = zoomLoaded === 'error'
    var {smallViewport} = this.context

    return art.image === 'valid' && <span className="imageStatus">
      {showLoadingMessage && loadingZoomMessage}
      {showErrorMessage && <p>Error loading high resolution image. <a href="mailto:collectionsdata+images@artsmia.org">Report this problem</a>.</p>}
      {art.restricted === 1 && !smallViewport && "Because of © restrictions, we can only show you a small image of this artwork." + copyrightAndOnViewMessage}
    </span>
  },

  calculateImagePixelSize(size) {
    var {image_width, image_height} = this.state.art
    var maxDimension = Math.max(image_width, image_height)
    var size = size || maxDimension
    var ratio = Math.floor(maxDimension/size)

    return Math.floor(image_width/ratio) * Math.floor(image_height/ratio)
  },

  // how many more pixels are in the full sized image than the given thumbnail?
  getPixelDifference(size=400) {
    return Math.floor(
      this.calculateImagePixelSize() - this.calculateImagePixelSize(400)
    )
  },

  isLoan() {
    return this.state.art.accession_number.match(/^L/i)
  },

  // different from the noIndex set at `App` - this factors in object status 
  noIndex() {
    return this.isLoan()
      || this.state.art.public_access == '0'
      || process.env.NODE_ENV !== 'production'
  },

  toggleInfoAndRelatedContent(event) {
    this.setState({smallViewportShowInfoOrRelatedContent: !this.state.smallViewportShowInfoOrRelatedContent})
    event.preventDefault()
  },
})
Artwork.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
  smallViewport: React.PropTypes.bool,
}

var noImageStyle = {
  wrapper: {
    "position": 'absolute',
    "top": '50%',
    "left": '50%',
    "transform": 'translate(-50%, -50%)',
    "WebkitTransform": 'translate(-50%, -50%)',
    "width": '77%',
    "textAlign": 'center',
  },
  pattern: {
  }
}
var NoImagePlaceholder = React.createClass({
  render() {
    var {art} = this.props
    var model = art["related:3dmodels"] && art["related:3dmodels"][0]
    return model ? <SketchfabEmbed model={model} /> :
      <div style={noImageStyle.wrapper}>
        <div className="noImage invalid"><p>No Image Available</p></div>
      </div>
  }
})

var SketchfabEmbed = React.createClass({
  render() {
    var showHideStyle = {}
    if(!this.props.show) showHideStyle.visibility = 'hidden'
    return <div className="sketchfab-embed-wrapper" style={showHideStyle}>
      <iframe
        src={`${this.props.model.link}/embed?autostart=1&preload=1&ui_infos=0`}
        frameborder="0"
        allowvr
        allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true"
        onmousewheel=""></iframe>
    </div>
  }
})

module.exports = Artwork
