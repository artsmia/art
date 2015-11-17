var React = require('react')
var Helmet = require('react-helmet')

var Peek = require('./peek')
var Department = require('./department')
var Search = require('./search')
var Artwork = require('./artwork')

var Explore = React.createClass({
  statics: {
    searchResults: Department.fetchData.searchResults
  },

  render() {
    return <div>
      <div className="explore-header"></div>
      <div className="explore-section" style={{padding: '0 2.5em'}}>
      {this.searches.map(({term, blurb}) => {
        var [facet, ...terms] = term.split(':')
        return <section>
          <h2>Explore <span style={{fontFamily: '"MiaGrotesk-Light",sans-serif'}}>{terms[1]}</span></h2>
          <p>{blurb}</p>
          <Peek
            offset={1}
            facet={facet}
            q={terms.join(':')}
            quiltProps={{maxRowHeight: 600}}
            directLinkTo={terms[1]}
            />
          <hr style={{visibility: 'hidden'}} />
        </section>
      })}
      <Helmet title="Explore the art" />
    </div></div>
  },


  searches: [
    {term:'_exists_:related:artstories', blurb:'ArtStories are digital explorations of Mia’s highlights and hidden gems—from intriguing details to secret backstories—available on your computer, phone, or tablet.'},
    {term:'_exists_:related:newsflashes', blurb:'Thought-provoking and a little cheeky, Newsflash updates connect current events to the art in the museum. Look for new updates taped to the gallery walls, or find old ones online.'},
    {term:'_exists_:related:audio-stops', blurb:'Audio Stops are mini-podcasts that present many of Mia’s highlights and favorite artworks through sound and stories. Connect in the galleries or at home.'},
    {term:'_exists_:related:stories', blurb:'Mia Stories is the museum beyond the walls, outside the frame, at the lively intersection of life and art. From behind-the-scenes buzz to inspiring connections with current events, it’s the museum in conversation.'},
  ],
})

module.exports = Explore
