var React = require('react')
var PureRenderMixin = require('react/addons').addons.PureRenderMixin
var debounce = require('debounce')

var linearPartition = require('linear-partitioning')
var ArtworkImage = require('./artwork-image')
var LazyLoad = require('react-lazy-load')

const ImageQuilt = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState() {
    return {
      active: null,
      unpinned: false,
      width: window.innerWidth || this.context.universal && 1000,
    }
  },

  handleResize: function(e) {
    if(!this.isMounted()) return
    this.setState({width: React.findDOMNode(this).clientWidth})
  },
  componentDidMount: function() {
    this.handleResize()
    window.addEventListener('resize', debounce(this.handleResize, 200))
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize)
  },

  render() {
    const artworks = this.props.artworks.slice(0, this.props.maxWorks)
    const _art = artworks.map((art) => {
      var s = art._source
      if(s.image == 'invalid' || (s.image_width == 0 && s.image_height == 0)) {
        var splitOn = /,|;|:|\]/;
        ([s.title_short, s.artist_short] = [s.title.split(splitOn)[0], s.artist.split(splitOn)[0]])
        var text = s.title_short
        s.text_length = text.length
        var deltaAverageTextLength = text.length/17 // bigger box for items with more text
        s.image_width = deltaAverageTextLength > 2 ? 300 : 200
        s.image_height = 200
      }
      return s
    })

    _art.map((art) => art.aspect_ratio = art.image_width/art.image_height)
    const summedAspectRatio = _art.reduce((sum, art) => {return sum+art.aspect_ratio}, 0)
    // Fit the images into `maxRows` or however many rows it would take to show each 
    // approx 200px tall
    var rowHeight = this.props.rowHeight || 200
    var numRows = Math.min(this.props.maxRows, Math.max(Math.floor(summedAspectRatio*rowHeight/this.state.width), 1))

    var rows = this.getPartition(artworks, numRows)

    const images = rows.map((row, index) => {
      var rowSummedAspectRatio = row.reduce((sum, art) => {return sum+art._source.aspect_ratio}, 0)
      var rowAspectRatio = rowSummedAspectRatio/row.length
      var unadjustedHeight = this.state.width/rowSummedAspectRatio

      var images = row.map((art) => {
        var _art = art._source
        const id = _art.id
        const width = _art.aspect_ratio/rowSummedAspectRatio*this.state.width
        const height = width/_art.aspect_ratio
        const maxRowHeight = this.props.maxRowHeight || 200
        const widthAdjustedToClipTallRows = unadjustedHeight > maxRowHeight ? width/(unadjustedHeight/maxRowHeight) : width

        return <QuiltPatch art={_art}
          width={widthAdjustedToClipTallRows}
          onClick={this.clicked.bind(this, art)}
          onMouseEnter={this.hovered.bind(this, art, true)}
          onMouseLeave={this.hovered.bind(this, art, false)}
          key={_art.id}
          lazyLoad={this.props.lazyLoad}
          />
      })

      // centered doesn't work on the first row because the search box is in the way
      // space-around looks best on bottom rows
      const justify = index == 0 && row.length <=3 ? 'space-around' : 'center'
      var rowStyle = {
        background: 'black',
        minHeight: Math.min(unadjustedHeight, this.props.maxRowHeight),
        display: 'flex',
        justifyContent: justify,
        whiteSpace: 'nowrap',
      }

      return <div className='quilt-row-wrap'
        key={'row'+index}
        style={rowStyle}>
        {images}
      </div>
    })

    return (
      <div className='quilt-wrap'  onMouseLeave={this.hovered.bind(this, null, false)} style={{cursor: 'pointer'}}>
        {images}
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
    this.cachedPartitions[memoKey] = rows
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
    var {art, width, lazyLoad, ...other} = this.props
    var id = art.id

    var style = {
      display: 'inline-block',
      verticalAlign: 'top',
      overflow: 'hidden',
      width: width,
      height: width/art.aspect_ratio
    }

    var nakedImage = <img style={style}
        key={id}
        src={`http://api.artsmia.org/images/${id}/400/medium.jpg`}
        {...other} />

    var image = !lazyLoad ? nakedImage : <LazyLoad wrapper="span" style={{display: 'inline'}} width={width}>
      {nakedImage}
    </LazyLoad>

    var textStyle = {
      ...style,
      backgroundColor: '#fff',
      padding: '0.25em',
      flexGrow: 1,
      whiteSpace: 'normal',
    }

    return art.image == 'valid' ? image : <span style={textStyle} {...other}>
      <p><strong>{art.title_short}</strong></p>
    </span>
  },

  getDefaultProps() {
    return {
      lazyLoad: true
    }
  },
})
