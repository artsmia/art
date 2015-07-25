var React = require('react')
var linearPartition = require('linear-partitioning')

const ImageQuilt = React.createClass({
  getInitialState() {
    return {
      active: null,
      unpinned: false,
      width: window.innerWidth,
    }
  },

  handleResize: function(e) {
    console.info('handleResize node width', React.findDOMNode(this).clientWidth)
    this.setState({width: React.findDOMNode(this).clientWidth})
  },
  componentDidMount: function() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize)
  },

  render() {
    const artworks = this.props.artworks.slice(0, this.props.maxWorks)
    const _art = artworks.map((art) => {
      var s = art._source
      if(s.image == 'invalid' || (s.image_width == 0 && s.image_height == 0)) {
        var text = s.title + s.artist
        s.text_length = text.length
        var deltaAverageTextLength = text.length/25 // bigger box for items with more text
        s.image_width = deltaAverageTextLength > 2 ? 500 : 300
        s.image_height = 150
      }
      return s
    })

    _art.map((art) => art.aspect_ratio = art.image_width/art.image_height)
    const summedAspectRatio = _art.reduce((sum, art) => {return sum+art.aspect_ratio}, 0)
    // Fit the images into `maxRows` or however many rows it would take to show each 
    // approx 250px tall
    var rowHeight = this.props.rowHeight || 250
    var numRows = Math.min(this.props.maxRows, Math.ceil(summedAspectRatio*rowHeight/this.state.width))

    const partitionBy = function(collection, weightFn, k) {
      let weights = collection.map(weightFn)
      let partition = linearPartition(weights, k)

      let index = 0
      return partition.map((weightedRow) => {
        return weightedRow.map((weight, i) => collection[index++])
      })
    }

    var rows = partitionBy(artworks, (art) => art._source.aspect_ratio*100, numRows)

    const images = rows.map((row, index) => {
      var rowSummedAspectRatio = row.reduce((sum, art) => {return sum+art._source.aspect_ratio}, 0)
      var images = row.map((art) => {
        var _art = art._source
        const id = _art.id
        const computedWidth = _art.aspect_ratio/rowSummedAspectRatio*this.state.width
        // browsers do their own thing when resizing images, which can break this row layout
        // `.floor`ing the computed width ensures that the images in this row will fit,
        // but leaves a gap at the right edge.
        // Multiplying the initial computed width, flooring that, then dividing by
        // the same factor "shaves" the right amount off each image.
        const _width = Math.floor(computedWidth*3)/3
        return <QuiltPatch art={_art}
          width={_width}
          onClick={this.clicked.bind(this, art)}
          onMouseEnter={this.hovered.bind(this, art, true)}
          onMouseLeave={this.hovered.bind(this, art, false)}
          />
      })

      return <div className='quilt-row-wrap' key={'row'+index} style={{background: 'black'}}>{images}</div>
    })

    return (
      <div className='quilt-wrap'  onMouseLeave={this.hovered.bind(this, null, false)} style={{cursor: 'pointer'}}>
        {images}
      </div>
    )
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


ImageQuilt.getImagedResults = (hits) => hits && hits
  .filter((hit) => hit._source.image == 'valid' && hit._source.image_width > 0)

module.exports = ImageQuilt

var QuiltPatch = React.createClass({
  render() {
    var {art, width, ...other} = this.props
    var id = art.id

    var style = {
      display: 'inline-block',
      verticalAlign: 'top',
      overflow: 'hidden',
      width: width,
      height: width/art.aspect_ratio
    }

    var image = <img style={style}
      key={id}
      src={`http://api.artsmia.org/images/${id}/400/medium.jpg`} {...other} />

    var textStyle = {
      ...style,
      backgroundColor: '#fff',
      padding: '0.25em',
    }

    return art.image == 'valid' ? image : <span style={textStyle} {...other}>
      <p><strong>{art.title}</strong></p>
      <p>{art.artist}</p>
    </span>
  },
})
