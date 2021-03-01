var React = require('react')
var {Link} = require('react-router')
var PureRenderMixin = require('react-addons-pure-render-mixin')
var ReactDOM = require('react-dom')
var debounce = require('debounce')
var cookie = require('react-cookie')

var linearPartition = require('linear-partitioning')
var ArtworkImage = require('./artwork-image')
var Image = require('./image')

const ImageQuilt = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState() {
    const artworks = this.props.artworks
    const maybeShuffledArtworks = this.props.shuffle ?
      artworks.sort(() => .5 - Math.random()) :
      artworks

    return {
      active: null,
      unpinned: false,
      width: window.innerWidth || this.context.universal && 1000,
      alwaysShow: cookie.load('freeTheQuilt'),
      shuffledArtworks: this.props.shuffle ? maybeShuffledArtworks : undefined,
      maxRows: this.props.maxRows,
      maxWorks: this.props.maxWorks,
    }
  },

  handleResize: function(e) {
    if(!this.isMounted()) return
    this.setState({width: ReactDOM.findDOMNode(this).clientWidth})
  },
  componentDidMount: function() {
    this.handleResize()
    window.addEventListener('resize', debounce(this.handleResize, 200))
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize)
  },

  render() {
    if(this.hideDarkenedQuilt()) return this.emptyQuiltToggleControl()

    const artworks = this.props.artworks.slice(0, this.state.maxWorks)
    const shuffledArtworks = this.state.shuffledArtworks && this.state.shuffledArtworks.slice(0, this.props.maxWorks)
    const _art = artworks.map((art) => {
      var s = art._source
      if(s.image == 'invalid' || (s.image_width == 0 && s.image_height == 0) || s.rights_type == 'Permission Denied') {
        s.image = 'invalid'
        var splitOn = /;|:|\]/;
        ([s.title_short, s.artist_short] = [s.title.split(splitOn)[0], s.artist.split(splitOn)[0]])
        var text = s.title_short
        s.text_length = text.length
        var deltaAverageTextLength = text.length/17 // bigger box for items with more text
        s.image_width = deltaAverageTextLength > 2 ? 300 : 200
        s.image_height = 200
      }
      return s
    })

    const { isInspiredByMia } = this.props
    const hPadding = this.props.isInspiredByMia ? '10px' : '0'
    const vPadding = this.props.isInspiredByMia ? '2em' : 0
    const hPaddingInt = Number(hPadding.replace(/[^0-9]/g, ''))

    isInspiredByMia
      ? _art.map((art) => art.aspect_ratio = (art.image_width+Number(hPaddingInt)*2)/art.image_height)
      : _art.map((art) => art.aspect_ratio = (art.image_width/art.image_height))
    const summedAspectRatio = _art.reduce((sum, art) => {return sum+art.aspect_ratio}, 0)
    // Fit the images into `maxRows` or however many rows it would take to show each
    // approx `rowHeight`px tall
    var rowHeight = !isInspiredByMia
      ? this.props.rowHeight || 200
      : 234 // bigger images for 'inspired by mia'
    var numRows = Math.min(this.props.maxRows, Math.max(Math.floor(summedAspectRatio*rowHeight/this.state.width), 1))

    var rows = this.getPartition(shuffledArtworks || artworks, numRows)

    console.info('ImageQuilt', {
      summedAspectRatio, rowHeight, numRows, rows,
      hPadding, hPaddingInt,
      vPadding,
      isInspiredByMia,
    })

    const images = rows.map((row, index) => {
      var rowSummedAspectRatio = row.reduce((sum, art) => {return sum+art._source.aspect_ratio}, 0)
      var rowAspectRatio = rowSummedAspectRatio/row.length
      var unadjustedHeight = this.state.width/rowSummedAspectRatio

      false && console.info('ImageQuilt row', {
        rowSummedAspectRatio,
        rowAspectRatio,
        unadjustedHeight,
      })

      var images = row.map((art) => {
        var _art = art._source
        const id = _art.id
        const width = _art.aspect_ratio/rowSummedAspectRatio*this.state.width
        const height = width/_art.aspect_ratio
        const maxRowHeight = this.props.maxRowHeight || 200
        const widthAdjustedToClipTallRows = unadjustedHeight > maxRowHeight ? width/(unadjustedHeight/maxRowHeight) : width

        false && console.info('ImageQuilt row image', {
          widthAdjustedToClipTallRows,
        })

        return <QuiltPatch art={_art}
          width={widthAdjustedToClipTallRows}
          onClick={this.clicked.bind(this, art)}
          onMouseEnter={this.hovered.bind(this, art, true)}
          onMouseLeave={this.hovered.bind(this, art, false)}
          onImageInvalidation={this.forceUpdate.bind(this)}
          key={_art.id}
          customImageFn={this.props.customImageFn}
          lazyLoad={this.props.lazyLoad}
          hPadding={hPadding}
        />
      })

      // centered doesn't work on the first row because the search box is in the way
      // space-around looks best on bottom rows
      const justify = index == 0 && row.length <=3 ? 'space-around' : 'center'
      var rowStyle = {
        minHeight: Math.min(unadjustedHeight, this.props.maxRowHeight || 200, 50),
        display: 'flex',
        justifyContent: justify,
        whiteSpace: 'nowrap',
        padding: `0 0 ${vPadding} 0`,
      }

      return <div className='quilt-row-wrap'
        key={'row'+index}
        style={rowStyle}>
        {images}
      </div>
    })

    var quiltStyle = {
      cursor: 'pointer',
      minHeight: 150,
      ...this.props.style,
    }

    return (
      <div className='quilt-wrap' onMouseLeave={this.hovered.bind(this, null, false)} style={quiltStyle}>
        {images}
        <div id="quilt-controls" style={{float: 'right', display: 'none'}}>
          {this.state.maxWorks < this.props.artworks.length && <a onClick={this.enlarge.bind(this, 1, 10)}>more thumbnails</a>}
          {this.state.maxWorks > 0 && <a onClick={this.enlarge.bind(this, -1, -10)}> / fewer</a>}
          <br/>
          <a onClick={this.enlarge.bind(this, 1, 0)}>bigger</a>
          <a onClick={this.enlarge.bind(this, -1, 0)}> / smaller</a>
          <br/>
          {this.state.morphDelta > 0 || <a onClick={this.morph.bind(this, 1)}>grow!</a>}
          {this.state.morphDelta < 0 || <a onClick={this.morph.bind(this, -1)}> / shrink!</a>}
          {this.state.morphDelta != 0 && <a onClick={this.resetMorph}> / stop!</a>}
          <br/>
          {(this.props.maxRows == this.state.maxRows && this.props.maxWorks == this.state.maxWorks) ||
            <a onClick={this.reset}>
              reset
            </a>
          }
        </div>
      </div>
    )
  },

  cachedPartitions: {},

  getPartition(artworks, numRows) {
    var memoKey = `rows:${this.props.maxRows}|width:${this.state.width}|${artworks.map(art => art._id).join('-')}`
    var memo = this.cachedPartitions[memoKey]
    if(memo) return memo

    const partitionBy = function(collection, weightFn, k) {
      let weights = collection.map(weightFn)
      let partition = linearPartition(weights, k)

      let index = 0
      return partition.map((weightedRow) => {
        return weightedRow.map((weight, i) => collection[index++])
      })
    }

    var rows = partitionBy(artworks, (art) => art._source.aspect_ratio*100, numRows)
    // Don't cache quilt partitions when server rendering, potential memory waterfall
    if(!this.context.universal) this.cachedPartitions[memoKey] = rows
    return rows
  },

  // The quilt changes the order of search results in 2 ways:
  // * clicking pins a result to the top, in which case it will stay there
  // * hovering 'floats' a result to the top, but it will sink back down
  // …after the interaction is finished.
  // Clicking the pinned artwork un-pins it
  clicked(art, updateState=true) {
    var {onClick} = this.props
    if(updateState) this.setState({active: art, unpinned: false})
    const sameArt = this.state.unpinned && !updateState ||
      updateState && this.state.active && art == this.state.active
    if(sameArt) {
      this.setState({active: null, unpinned: true})
      art = null
    }
    onClick && onClick(art)
    this.state.unpinned && this.setState({unpinned: false})
  },
  hovered(art, active) {
    if(this.props.disableHover) return
    // cancel the delayed 'float' on mouseleave
    // if an artwork was clicked, leave it pinned
    if(!active) {
      clearTimeout(this.activate)
      if(!art) this.clicked(this.state.active, false)
      return
    }
    this.activate = setTimeout(this.clicked.bind(this, art, false), 300)
  },

  hideDarkenedQuilt() {
    return this.props.darken && !this.state.alwaysShow
  },

  emptyQuiltToggleControl() {
    var styles = {
      minHeight: '7rem',
      display: 'inline-block',
      width: '100%',
      WebkitUserSelect: 'none',
      cursor: 'pointer',
      zIndex: 100,
    }

    return <span className='quilt-wrap dark' style={styles} onDoubleClick={this.freeTheQuilt} />
  },

  freeTheQuilt() {
    cookie.save('freeTheQuilt', true)
    this.setState({alwaysShow: true})
  },

  enlarge(rows=1, works=10) {
    this.setState({
      maxRows: this.state.maxRows+rows,
      maxWorks: this.state.maxWorks+works,
    })
  },
  reset() {
    console.info('resetting quilt', this.props)
    if(this.state.morphInterval) clearInterval(this.state.morphInterval)
    this.setState({
      maxRows: this.props.maxRows,
      maxWorks: this.props.maxWorks,
    })
  },
  morph(delta=1) {
    const morph = () => {
      console.info('morphing', this.state.maxWorks, this.props.artworks.length)
      if(this.state.maxWorks > this.props.artworks.length || this.state.maxRows <= 0) {
        clearInterval(this.state.morphInterval)
        this.setState({morphDelta: 0, morphInterval: false})
      }
      this.enlarge(delta, delta*5)
    }
    this.enlarge(delta, delta*5)
    this.setState({
      morphDelta: delta,
      morphInterval: setInterval(morph, 3000)
    })
  },
  resetMorph() {
    this.setState({morphDelta: 0})
    clearInterval(this.state.morphInterval)
  },
})
ImageQuilt.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
}

ImageQuilt.getImagedResults = (hits) => hits && hits
  .filter((hit) => hit._source.image == 'valid' && hit._source.image_width > 0)

module.exports = ImageQuilt

var QuiltPatch = React.createClass({
  render() {
    var {art, width, customImageFn, hPadding, ...other} = this.props
    var id = art.id

    var style = {
      display: 'inline-block',
      verticalAlign: 'top',
      overflow: 'hidden',
      width: width,
      height: width/art.aspect_ratio,
      margin: `0 ${hPadding}`,
    }

    var imgStyle = {
      ...style,
      left: "50%",
      top: "50%",
      transform: "translateY(-50%) translateX(-50%)",
      WebkitTransform: "translateY(-50%) translateX(-50%)",
      position: "absolute",
    }

    false && console.info('QuiltPatch', {hPadding, imgStyle})

    var image = <Image
      art={art}
      style={imgStyle}
      customImage={customImageFn}
      {...other}
    />

    var textStyle = {
        ...style,
        display: 'table',
        whiteSpace: 'normal',
    }

    var patch = art.image == 'valid' ? image : <span className='invalid' style={textStyle} {...other}>
      <p><strong>{art.title_short}</strong></p>
    </span>

    return <Link
      onClick={this.clickOrDontClick}
      style={{...style, position: 'relative'}}
      to="artwork"
      params={{id: art.id}}>{patch}</Link>
  },

  // halt the click event if javascript is loaded
  // clicking triggers the right-hand preview, not the `<a>`
  // TODO make this work with command click tho
  clickOrDontClick(event) {
    if(!this.context.universal) event.preventDefault()
  },

  getDefaultProps() {
    return {
      lazyLoad: true,
      darken: false,
    }
  },
})
QuiltPatch.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
}
