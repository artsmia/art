var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var rest = require('rest')

var RandomArtwork = require('./random-artwork')
var ArtworkPreview = require('./artwork-preview')

// Example:
//
// var ArtworkCard = (props) => {
//   return <div>
//     <ArtworkPreview {...props}>
//       <a href="#" onClick={props.changeArtwork} value="Next!">Next!</a>
//     </ArtworkPreview>
//   </div>
// }

// var RandomArtworkCard = RandomArtwork(ArtworkCard, 'room:G3* image:valid public_access:1')

var VotingBooth = React.createClass({
  render() {
    var linkStyle = {margin: '1em', display: 'inline-block'}
    return <div>
      <ArtworkPreview {...this.props} showPeeks={false}>
        <a href="#" style={linkStyle} onClick={this.vote.bind(this, 1)}>&uarr; I like this</a>
        <a href="#" style={linkStyle} onClick={this.vote.bind(this, -1)}>&darr; I don't like this</a>
      </ArtworkPreview>
    </div>
  },

  vote(direction) {
    console.info('voting', direction)
    this.props.changeArtwork()
  },
})

var VoteForRandomArtworkCard = RandomArtwork(VotingBooth, 'room:G3* image:valid public_access:1')

var Survey = React.createClass({
  render() {
    return <div style={{margin: '3em'}}>
      <VoteForRandomArtworkCard />
    </div>
  },
})

module.exports = Survey

