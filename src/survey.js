var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var rest = require('rest')

var RandomArtwork = require('./random-artwork')
var ArtworkPreview = require('./artwork-preview')
var SEARCH = require('./endpoints').search
var restWithCorsCookies = require('./rest-with-cookies')

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
    var linkStyle = {margin: '0.25em', display: 'inline-block'}
    var votingActions = <div style={{margin: '1em'}}>
      <a href="#" style={linkStyle} onClick={this.vote.bind(this, 'like')}>&uarr; I like this</a>
      <a href="#" style={linkStyle} onClick={this.vote.bind(this, 'dislike')}>&darr; I don't like this</a>
      <a href="#" style={linkStyle} onClick={this.next}>&rarr; skip</a>
    </div>

    return <div style={this.props.style}>
      {votingActions}
      <ArtworkPreview {...this.props} showPeeks={false}>
        {votingActions}
      </ArtworkPreview>
    </div>
  },

  vote(direction) {
    var {id} = this.props.art
    restWithCorsCookies(`${SEARCH}/survey/art/${id}/${direction}`)
      .then(this.props.incrementProgress)
      .then(this.next)
  },

  next() {
    this.props.changeArtwork()
  },
})

var VoteForRandomArtworkCard = RandomArtwork(VotingBooth, {
  searchQuery: 'room:G3* image:valid public_access:1',
  preloadNext: true,
})

var Survey = React.createClass({
  render() {
    var thanksMessage = <div>
      <p>
        Thanks for helping Mia visitors make new connections to diverse artworks.
        <a href="#" onClick={this.incrementProgress}>Feel free to keep at it</a>
        , but you’ve succeeded in giving us enough data to influence our algorithm.
      </p>

      <a href="#" onClick={this.incrementProgress}>Keep going</a>
    </div>
    var sessionProgress = this.state.sessionProgress

    return <div style={{margin: '1em'}}>
      {sessionProgress == 11 ?
        thanksMessage :
        <VoteForRandomArtworkCard incrementProgress={this.incrementProgress} />
      }
    </div>
  },

  componentDidMount() {
    restWithCorsCookies(`${SEARCH}/survey/getUser`)
    this.props.toggleAppHeader()
  },

  getInitialState() {
    return {
      sessionProgress: 0 // number of votes this session
    }
  },

  incrementProgress() {
    this.setState({sessionProgress: this.state.sessionProgress+1})
  },
})

module.exports = Survey

