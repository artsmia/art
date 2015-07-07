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
    this.setState({width: window.innerWidth})
  },
  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize)
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize)
  },

  render() {
    const artworks = this.props.artworks.slice(0, this.props.maxWorks)
    const _art = artworks.map((art) => art._source)

    _art.map((art) => art.aspect_ratio = art.image_width/art.image_height)
    const viewportWidth = window.innerWidth-16 // body { margin: 8px; }
    const summedAspectRatio = _art.reduce((sum, art) => {return sum+art.aspect_ratio}, 0)
    // Fit the images into `maxRows` or however many rows it would take to show each 
    // approx 250px tall
    const numRows = Math.min(this.props.maxRows, summedAspectRatio*250/viewportWidth) 

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
        const computedWidth = _art.aspect_ratio/rowSummedAspectRatio*viewportWidth
        // browsers do their own thing when resizing images, which can break this row layout
        // `.floor`ing the computed width ensures that the images in this row will fit,
        // but leaves a gap at the right edge.
        // Multiplying the initial computed width, flooring that, then dividing by
        // the same factor "shaves" the right amount off each image.
        const _width = Math.floor(computedWidth*3)/3
        return <img style={{
          display: 'inline-block',
          width: _width,
          height: _width/_art.aspect_ratio
        }}
        key={id}
        onClick={this.clicked.bind(this, art)}
        onMouseEnter={this.hovered.bind(this, art, true)}
        onMouseLeave={this.hovered.bind(this, art, false)}
        src={`http://api.artsmia.org/images/${id}/400/medium.jpg`} />
      })

      return <div key={'row'+index} style={{background: 'black'}}>{images}</div>
    })

    return (
      <div onMouseLeave={this.hovered.bind(this, null, false)} style={{cursor: 'pointer'}}>
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
    if(updateState) this.setState({active: art, unpinned: false})
    const sameArt = this.state.unpinned && !updateState ||
      updateState && this.state.active && art == this.state.active
    if(sameArt) {
      this.setState({active: null, unpinned: true})
      art = null
    }
    this.props.onClick(art)
    this.state.unpinned && this.setState({unpinned: false})
  },
  hovered(art, active) {
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

module.exports = ImageQuilt
