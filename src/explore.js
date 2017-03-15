var React = require('react')
var Helmet = require('react-helmet')

var Peek = require('./peek')
var Department = require('./department')
var Search = require('./search')
var Artwork = require('./artwork')
var ExpandableNewArtsmiaContentBlock = require('./expandable-new-artsmia-content-block')

var Explore = React.createClass({
  statics: {
    searchResults: Department.fetchData.searchResults
  },

  render() {
    return <div>
      <a href="/art/8747" className="explore-header"></a>
      <div className="explore-section" style={{padding: '0 2.5vmax'}}>
        {this.searches.map(({term, blurb}, index) => {
          var [facet, ...terms] = term.split(':')
          return <section>
            <h2>Explore <span style={{fontFamily: '"MiaGrotesk-Light",sans-serif'}}>{terms[1]}</span></h2>
            <p>{blurb}</p>
            <Peek
              offset={index*5}
              facet={facet}
              q={terms.join(':')}
              quiltProps={{maxRowHeight: 600}}
              directLinkTo={terms[1]}
              shuffleQuilt={true}
              />
            <hr style={{visibility: 'hidden'}} />
          </section>
        })}

        <div>
          <h2>Personalize Mia with new ways to explore art.</h2>

          <h3>Journeys</h3>
          <p>Use this new app to create a personalized journey through the museum or follow the suggestions of others. Either way, we’ll map it out for you. <a href="https://itunes.apple.com/us/app/mia-journeys/id1058993004">Download the app free (iOS).</a></p>
          <ExpandableNewArtsmiaContentBlock page="journeys" />

          <h3>Overheard</h3>
          <p>Eavesdrop on the conversations of fictional fellow visitors as they wander the galleries, using this playful new audio app. <a href="https://itunes.apple.com/us/app/overheard-mia/id1116319582">Download it free (iOS)</a>.</p>
          <ExpandableNewArtsmiaContentBlock page="overheard" />

          <h3>ArtStories</h3>
          <p>In-depth multimedia explorations of Mia’s highlights and hidden gems—from intriguing details to secret backstories. Available on iPads in the galleries, and optimized for your smartphone or home computer: <a href="https://artstories.artsmia.org">ArtStories</a>.</p>
          <ExpandableNewArtsmiaContentBlock page="artstories" />
        </div>
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
