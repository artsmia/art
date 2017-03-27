var React = require('react')
var rest = require('rest')

var ArtworkPreview = require('./artwork-preview')
var SEARCH = require('./endpoints').search

var RandomArtworkContainer = (ComposedComponent, searchQuery) => React.createClass({
  getInitialState() {
    return {
      art: null,
    }
  },

  componentDidMount() {
    var id = this.props.initialId

    this.setArtwork(id)
  },

  setArtwork(id) {
    var searchUrl = id ? `${SEARCH}/id/${id}` : `${SEARCH}/random/art`
    if(!id && searchQuery) searchUrl += `?q=${searchQuery}`
    rest(searchUrl)
    .then(data => this.setState({art: JSON.parse(data.entity)}))
  },

  changeArtwork() {
    this.setArtwork()
  },

  render() {
    return this.state.art ?
      <ComposedComponent art={this.state.art} changeArtwork={this.changeArtwork} {...this.props} /> :
      <span />
  },
})

module.exports = RandomArtworkContainer
