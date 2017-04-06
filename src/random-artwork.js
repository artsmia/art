var React = require('react')
var rest = require('rest')

var ArtworkPreview = require('./artwork-preview')
var SEARCH = require('./endpoints').search

var RandomArtworkContainer = (ComposedComponent, options={}) => React.createClass({
  getInitialState() {
    return {
      art: null, // the current random artwork
      next: null,
      history: [], // previously selected random arts
    }
  },

  componentDidMount() {
    var id = this.props.initialId

    this.setArtwork(id)
  },

  setArtwork(id) {
    var searchUrl = id ? `${SEARCH}/id/${id}` : `${SEARCH}/random/art`
    if(!id && options.searchQuery) searchUrl += `?q=${options.searchQuery}`

    // TODO clean up this logic
    var {preloadNext} = options
    if(preloadNext && this.state.next) {
      this.setState({
        art: this.state.next,
        history: this.state.history.concat(this.state.art),
      })
    } else {
      rest(searchUrl).then(data => this.setState({art: JSON.parse(data.entity)}))
    }
    if(preloadNext) rest(searchUrl)
      .then(data => this.setState({next: JSON.parse(data.entity)}))
  },

  changeArtwork() {
    this.setArtwork()
  },

  render() {
    var {art, next} = this.state
    if(!art) return <span />

    var currentComponent = <ComposedComponent
        art={art}
        changeArtwork={this.changeArtwork}
        {...this.props}
      />

    return !options.preloadNext ?
      currentComponent :
      <div>
        {currentComponent}
        {next && <ComposedComponent
          art={next}
          changeArtwork={this.changeArtwork}
          {...this.props}
          style={{display: 'none'}}
        />}
      </div>
  },
})

module.exports = RandomArtworkContainer
