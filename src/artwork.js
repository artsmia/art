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
var ArtworkPageMetadata = require('./artwork/page-metadata')
var rightsDescriptions = require('./rights-types.js')
var ClosedBanner = require('./museum-closed-banner')

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

        if((isLoan(art) || notPublicAccess(art)) && !window.privilegedClientIP) {
          return callback('permission denied', art)
        }

        callback(false, art)
      })
    },

    willTransitionTo: function (transition, params, query, callback) {
      if(params.id === 'leaflet-src.js.map')
        return transition.redirect('home', {...params, status: 404})

      Artwork.checkRoute(params, (err) => {
        switch(err) {
          case 'mismatched slug': transition.redirect('artworkSlug', params)
          case 'permission denied': transition.redirect('home', {...params, status: 403})
        }
      })
      .then(callback)
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

    var imageUrl = art.image_url || imageCDN(id)
    var canonicalURL = `https://collections.artsmia.org/art/${art.id}/${art.slug}`

    var aspectRatio = art.image_width/art.image_height
    var mapHeight = aspectRatio && art.image == "valid" ?
      Math.max(40, Math.min(65, 1/aspectRatio*80)) :
      20
    if(smallViewport && this.state.show3d) mapHeight = 67

    var image = <Image art={art} style={{maxWidth: '95%', maxHeight: mapHeight-5+'vh'}} />

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
      lineHeight: '0.3em',
      padding: '0.3em',
    }
    var exploreStyle = {
      display: 'block',
      transform: 'translateY(-13px)',
      paddingLeft: '2em',
      // TODO - use a background image to center this better?
      // but it's hard because one thing we want to use is a font icon
      // and the other is an svg…
      // backgroundImage: 'url(/images/more.svg)',
      // backgroundPosition: 'left center',
      // backgroundRepeat: 'none',
    }
    var exploreIcon = showMoreIcon &&
      <a href="#" onClick={this.toggleInfoAndRelatedContent} style={infoRelatedToggleStyles}>
        {!toggleRelated ?
          <img src="/images/more.svg" style={{width: '1.7em'}}/> :
          <i className="control material-icons">info</i>}
        <span style={exploreStyle}>
          {!toggleRelated ? 'Explore' : 'Info'}
        </span>
      </a>
    var relatedContent = <ArtworkRelatedContent id={id} art={art} />

    var mapStyle = smallViewport ?
      {width: '100%', display: 'inline-block', height: mapHeight+'vh'} :
      stickyMapStyle

    var {zoomLoaded, zoomLoadComplete} = this.state
    var zoomLoadedSuccessfully = zoomLoaded && zoomLoaded !== 'error' && zoomLoadComplete

    var rights = rightsDescriptions.getRights(art)
    var map = <div ref='map' id='map' style={mapStyle} className={['leaflet-container', zoomLoadedSuccessfully && 'zoomLoaded'].join(' ')}>
      {this.state.has3d && <SketchfabEmbed model={this.state.has3d} show={this.state.show3d} />}
      {(art.image == 'valid' && rights !== 'Permission Denied') && <div id="staticImage" className={zoomLoadedSuccessfully && 'zoomLoaded'}>
        {image}
        {!!zoomLoaded || (art.image_copyright && <p style={{fontSize: '0.8em'}}>{decodeURIComponent(art.image_copyright)}</p>)}
      </div> || <NoImagePlaceholder art={art} />}
      {this.imageStatus()}
      {smallViewport && showMoreIcon && exploreIcon}
    </div>

    var showCropUI = this.state.showBiggie
    var detailCropper = showCropUI && <div style={{marginTop: '1em'}}>
      <IIIFCropper
        captureViewRegion={this.captureViewRegion}
        updateRegion={(args) => this.setState(args)}
        currentRegion={this.state.iiifRegion}
        cropAspectRatio={this.state.cropAspectRatio}
        art={art}
      />
    </div>

    var info = <div className='info'>
      {this.props.children || <div>
        {smallViewport && <div style={{margin: '-2em 0 1em 0'}}>{detailCropper}</div>}
        <ArtworkPreview art={art} showLink={this.props.showLink} showDuplicateDetails={true} />
        {this.state.has3d && <div className="images">
          <p onClick={this.toggle3d}>{this.state.show3d ? 'show high-res image' : 'show 3D model'}</p> 
        </div>}
        <div className="back-button">
          {this.props.showLinkComponent || (window.history && history.length > 1 ? <a href="#" onClick={() => history.go(-1)}>
            <i className="material-icons">arrow_back</i> back
          </a> : <Link to="/"><i className="material-icons">arrow_back</i> home</Link>)}
        </div>
        {smallViewport || relatedContent}
        <div>
          <h5 className='details-title'>Details</h5>
          <ArtworkDetails art={art} show3d={this.state.show3d} />
        </div>
      </div>}
      <ClosedBanner />

      {smallViewport || detailCropper}

      {false && <a href={`?manifest=https://iiif.dx.artsmia.org/${this.state.id}.jpg/manifest.json`}>
        <img src="iiif-dragndrop-100px.png" alt="IIIF Drag-n-drop" /> IIIF!
      </a>}
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
      <ArtworkPageMetadata art={art} noIndex={this.notPublicAccess()} />
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
    art.id = this.props.id || (isNaN(art.id)
      ? art.id.replace('http://api.artsmia.org/objects/', '')
      : art.id)

    var has3Dmodel = art["related:3dmodels"] && art["related:3dmodels"][0]
    var navigatedFrom3dModelSearch = window &&
      window.lastSearchedTerms && 
      window.lastSearchedTerms.indexOf('related:3dmodels') >= 0

    
    var rights = rightsDescriptions.getRights(art)
    const showBiggie = art.restricted === 0 
      || ['Copyright Protected', 'Needs Permission', 'In Copyright',
        "In Copyright - Rights-holder(s) Unlocatable or Unidentifiable",
        "In Copyright–Rights-holder(s) Unlocatable",
        "Copyright Not Evaluated",
        "Permission Denied"
      ].indexOf(rights) < 0

    return {
      art: art,
      id: art.id,
      fullscreenImage: false,
      has3d: has3Dmodel,
      show3d: navigatedFrom3dModelSearch,
      smallViewportShowInfoOrRelatedContent: window && window.enteredViaMore,
      showBiggie,
    }
  },

  shouldComponentUpdate(prevProps, prevState) {
    return true
  },

  componentDidMount() {
    this.initView()
  },

  initView() {
    var art = this.state.art
    this.setState({zoomLoaded: false, zoomLoadComplete: false, zoomLoadedSuccessfully: false})

    if(art.image === 'valid' && this.state.showBiggie && !this.isLoan() && !this.state.show3d) {
      this.loadZoom({reset: true})
    } else {
      this.map.off()
      this.map.remove()
      this.map = undefined
      this.tiles = undefined
    }
    
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
        this.loadZoom({reset: true})
      }
    }

    if(this.state.id !== this.props.data.artwork.id) {
      this.setState(this.getInitialState())
      setTimeout(this.initView, 1000)
    }
  },

  loadZoom(options = {reset: false}) {
    var L = require('leaflet')
    var Liiif = require('leaflet-iiif')
    var fullscreen = require('leaflet-fullscreen')
    
    var art = this.state.art
    this.setState({zoomLoaded: false, zoomLoading: true})

    if(options && options.reset && this.map) {
      this.map.off()
      this.map.remove()
      this.map = undefined
      this.tiles = undefined
    }

    const id = this.state.id
    const iiif0Url = `https://tiles.dx.artsmia.org/iiif/${this.state.id}`
    const iiifUrl = `https://iiif.dx.artsmia.org/${this.state.id}.jpg/info.json`

    rest(iiif0Url).then(
    rest(iiifUrl)
    .then(
      response => JSON.parse(response.entity),
      rejected => {
        // TODO: log this somewhere
        this.setState({zoomLoaded: 'error'})
        return Promise.reject(new Error(`can't load tiles for ${art.id}`))
      }
    ))
    .then((data) => {
      this.map = L.map(this.refs.map, {
        crs: L.CRS.Simple,
        zoomControl: false,
        zoomSnap: 0,
      })
      window._map = this.map
      this.map.attributionControl.setPrefix('')
      const showZoomControlsIfDesktop = !L.Browser.touch || window.innerWidth > 780
      if(showZoomControlsIfDesktop) new L.Control.Zoom({ position: 'topright' }).addTo(this.map)
      new L.Control.Fullscreen({
        position: 'topright',
        pseudoFullscreen: true,
      }).addTo(this.map)

      this.tiles = L.tileLayer.iiif(iiifUrl, {
        attribution: art.image_copyright ? decodeURIComponent(art.image_copyright) : '',
        fitBounds: true,
        setMaxBounds: true,
        tileSize: 512,
        id: id,
        fudgeTileSize: 0.3,
        iiifImageData: data,
      })

      this.map.setView([0, 0], 0)

      this.tiles.addTo(this.map)

      window._tiles = this.tiles
      this.tiles.on('load', (event) => {
        this.setState({zoomLoadComplete: true})
        if(this.map.getMinZoom() > 0) return
        // don't let the zoomed image get tiny
        const minZoom = this.map.getZoom() - 0.3
        console.info('set minZoom', minZoom)
        this.map.setMinZoom(minZoom)
        // TODO - reset minZoom when window is resized
        // …and when fullscreen changes?
      })

      this.setState({zoomLoading: false, zoomLoaded: true})

      this.map.on('fullscreenchange', () => {
        this.setState({fullscreenImage: !this.state.fullscreenImage})
        this.props.toggleAppHeader()
      })

      var interval = 400
      false && setTimeout(function() {
        // if not tile images have been loaded, force a zoom in and then a zoom out.
        // This tricks leaflet to load the tiles? I'm not sure why but it probably has
        // to do with a fractional zoom bug that I don't want to get into right now…
        var tileContainer = _map._mapPane.querySelector('.leaflet-tile-container')
        var tileElems = tileContainer.childElementCount 
        console.info('map tiles loaded', {tileElems, tileContainer})

        if(tileElems <= 1) {
          console.info('zooming out then back in', {max: _map.getMaxZoom()})
          _map.setZoom(_map.getMaxZoom())
          setTimeout(function() {
            _map.setZoom(_tiles.options.minZoom+0.5)
            setTimeout(function() {
              _map.setZoom(_tiles.options.minZoom+0.4)
              setTimeout(function() {
                _map.setZoom(_tiles.options.minZoom+0.3)
                setTimeout(function() {
                  _map.setZoom(_tiles.options.minZoom+0.2)
                  setTimeout(function() {
                    _map.setZoom(_tiles.options.minZoom+0.1)
                    setTimeout(function() {
                      _map.setZoom(_tiles.options.minZoom)
                    }, interval)
                  }, interval)
                }, interval)
              }, interval)
            }, interval)
          }, interval)
        } else {
          console.info('not simulating zoom in/out?')
        }
      }, 1000)

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
    }
  },

  /**
   * convert the currently viewed area of the zoomable image to an IIIF deriv
   * thankya https://bl.ocks.org/mejackreed/6936585f435b60aa9451ae2bc1c199f2
   */
  captureViewRegion() {
    if(!this.map) return

    let { cropAspectRatio } = this.state

    let map = this.map
    let iiifLayer = this.tiles
    let bounds = map.getBounds()
    let fractionalZoom = map.getZoom()
    let zoom = Math.floor(fractionalZoom) // should this be floor, or round?
    let min = map.project(bounds.getSouthWest(), zoom)
    let max = map.project(bounds.getNorthEast(), zoom)
    let imageSize = iiifLayer._imageSizes[zoom]
    let xRatio = iiifLayer.x / imageSize.x
    let yRatio = iiifLayer.y / imageSize.y

    let x0 = Math.max(0, Math.floor(min.x * xRatio))
    let y0 = Math.max(0, Math.floor(max.y * yRatio))
    let w = Math.floor((max.x - min.x) * xRatio)
    let h = Math.floor((min.y - max.y) * yRatio)
    /**
     * To constrain the crop to a specific aspect ratio:
     *
     *  square = 1/1, and 3:2 (which is actually 2/3? Confuses me, but it's working)
     *
     * Adapt the rectangular region to be the desired aspect ratio by
     * 'shaving' it down to fit. To get a taller region down to 3:2, 
     * take the width as `3`, then remove a strip from the top and bottom
     * so that the height ends up as `2`. This weighs the 3:2 crop to the center.
     * TODO adding an option to weigh to the edge of the image might be nice
     */
    let deltaFactor = (cropAspectRatio || 1)*2
    let whDelta = Math.round((w - h) / deltaFactor)
    let adjustedX0 = w > h ? x0 + whDelta : x0
    let adjustedY0 = h >= w ? y0 - whDelta : y0
    let whMin = Math.min(w, h)
    let adjustedW = whMin
    let adjustedH = Math.round(whMin*cropAspectRatio)
    let constrainToAspectRatio = Boolean(cropAspectRatio)
    let region = !constrainToAspectRatio
      ? [ x0, y0, w, h ]
      : [
        adjustedX0,
        adjustedY0,
        adjustedW,
        adjustedH,
      ]

    if(constrainToAspectRatio) {
      // Indicate where the square crop is coming from with a polygon overlay
      // that's removed after a second or two
      let detailHighlightLayer = L.rectangle([
        L.point(adjustedX0, adjustedY0), // top left
        L.point(adjustedX0+adjustedW, adjustedY0+adjustedH), // bottom right
      ].map(point => map.unproject(point, zoom)))
      setTimeout(() => detailHighlightLayer.addTo(map), 31)
      setTimeout(() => detailHighlightLayer.remove(), 3579)
    }

    let baseUrl = 'https://iiif.dx.artsmia.org'
    let url = baseUrl + '/' + this.state.id + '.jpg/' + region.join(',') + '/800,/0/default.jpg'

    this.setState({iiifRegion: url})
  },

  imageStatus() {
    var {art, zoomLoaded, zoomLoadComplete, zoomLoading} = this.state
    var copyrightAndOnViewMessage = art.room && art.room[0] == 'G' ? " (You'll have to come see it in person.)" : ''
    var loadingZoomMessage =  `
      (—Is that the best image you've got!!?
      —Nope! We're loading ${humanizeNumber(this.getPixelDifference(800))} more pixels right now.
      It can take a few seconds.)`
    var showLoadingMessage = zoomLoading && zoomLoaded === false && !this.context.universal
    var showErrorMessage = zoomLoaded === 'error'
    var {smallViewport} = this.context

    const showCopyrightNotice = !this.state.showBiggie

    return art.image === 'valid' && <span className="imageStatus">
      {showLoadingMessage && loadingZoomMessage}
      {showErrorMessage && <p>Error loading high resolution image. <a href="mailto:collectionsdata+images@artsmia.org">Report this problem</a>.</p>}
      {showCopyrightNotice && !smallViewport && "Because of © restrictions, we can only show you a small image of this artwork." + copyrightAndOnViewMessage}
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
  getPixelDifference(size=800) {
    return Math.floor(
      this.calculateImagePixelSize() - this.calculateImagePixelSize(800)
    )
  },

  isLoan() {
    return this.state.art.accession_number.match(/^L/i)
  },

  notPublicAccess() {
    return isLoan(this.state.art)
      || notPublicAccess(this.state.art)
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
  clientIp: React.PropTypes.string,
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

function isLoan(art) {
  return !!art.accession_number.match(/^L/i)
}
function notPublicAccess(art) {
  return art.public_access === '0'
}

var IIIFCropper = React.createClass({
  getInitialState(props) {
    return {
        isLoading: true,
        squareSmartCrop: `https://iiif.dx.artsmia.org/${this.props.art.id}.jpg/-1,-1,800,800/full/0/default.jpg`,
        cropSize: 800,
      }
  },

  render() {
    const { art, captureViewRegion, updateRegion, currentRegion, cropAspectRatio } = this.props
    const { isLoading, squareSmartCrop, cropSize } = this.state
    const isSquare = currentRegion === squareSmartCrop
    const getCropFromZoomer = () => {
      this.setState({cropSize: 800})
      captureViewRegion()
    }
    const setSquareSmartCrop = () => updateRegion({iiifRegion: squareSmartCrop, cropAspectRatio: 1})

    const buttonStyles = {
      color: 'white',
      background: '#232323',
      opacity: isLoading ? 0.3 : 1,
    }

    const imgStyle = {
      maxWidth: '100%',
      maxHeight: '300px',
      opacity: isLoading ? 0.3 : 1,
    }

    const rawIIIFUrl = (currentRegion || squareSmartCrop)
    // TODO node v7 (running on the server) doesn't support capturing named groups?
    // const iiifComponents = rawIIIFUrl.match(/.org\/(?<id>[0-9]+).jpg\/(?<region>[^/]+)\/(?<size>[^/]+)\/0\/default.jpg/)
    // const iiifSize = iiifComponents.groups.size
    const iiifComponents = rawIIIFUrl.match(/.org\/([0-9]+).jpg\/([^/]+)\/([^/]+)\/0\/default.jpg/)
    const iiifSize = iiifComponents[3]
    const iiifUrl = rawIIIFUrl.replace(iiifSize, cropSize === 'full' ? cropSize : `${cropSize},`)

    return <div>
      {iiifUrl && <details open={Boolean(currentRegion)}>
        <summary>
          <button onClick={getCropFromZoomer} disabled={isLoading} style={buttonStyles}>
            📷 Save detail
          </button> {' '}
          {(!currentRegion || isSquare) || <button onClick={setSquareSmartCrop} style={buttonStyles}>
            ✂️  Smart Crop
          </button>}
        </summary>
        <figure style={{margin: 0}}>
          <a href={iiifUrl} target="_blank">
            <img
              src={iiifUrl}
              style={imgStyle}
              onLoad={() => this.setState({isLoading: false})}
              onError={() => this.setState({isLoading: false, error: true})}
            />
          </a>
          <figcaption>
            {isLoading || <div>
              <p>{[400, 800, 1200, 'full'].map(size => {
                const sizeText = isNaN(size) ? 'full size' : `${size}px`
                return cropSize === size
                  ? <span key={size} style={{padding: '0px 7px'}}>{sizeText}</span>
                  : <button key={size} onClick={() => this.setState({cropSize: size, isLoading: true})} style={buttonStyles}>{sizeText}</button>
              })}</p>
              <label style={{display: 'block'}}>
                <input
                  name="cropAspectRatio"
                  type="radio"
                  checked={cropAspectRatio !== 1 && cropAspectRatio !== 2/3}
                  onClick={() => updateRegion({cropAspectRatio: null})}
                /> no aspect ratio
                <input
                  name="cropAspectRatio"
                  type="radio"
                  checked={cropAspectRatio === 1}
                  onClick={() => updateRegion({cropAspectRatio: 1})}
                /> square
                <input
                  name="cropAspectRatio"
                  type="radio"
                  checked={cropAspectRatio === 2/3}
                  onClick={() => updateRegion({cropAspectRatio: 2/3})}
                /> 3:2
              </label>
            </div>}
            <p>Zoom in on the left to the detail you'd like to save. Click 'Save detail' and wait until the image updates. Right click the image to 'save image as' or copy link, or click the image to open in a new tab.</p>
          </figcaption>
        </figure>
      </details>}
    </div>
  },

  componentWillUpdate(nextProps, nextState) {
    if (this.props.currentRegion !== nextProps.currentRegion) {
      this.setState({isLoading: true})
    }
  }
})
