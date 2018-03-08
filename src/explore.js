var React = require('react')
var Helmet = require('react-helmet')

var Peek = require('./peek')
var Department = require('./department')
var Search = require('./search')
var Artwork = require('./artwork')
var ExpandableNewArtsmiaContentBlock = require('./expandable-new-artsmia-content-block')
var Markdown = require('./markdown')

var Explore = React.createClass({
  statics: {
    searchResults: Department.fetchData.searchResults
  },

  render() {
    const appThumbStyle = {
      maxWidth: '5em',
      marginRight: '1em',
      float: 'left',
    }

    const clearHr = <hr style={{visibility: 'hidden', clear: 'both'}} />
    return <div>
      <a href="/art/8747" className="explore-header"></a>
      <div className="explore-section" style={{padding: '0 2.5vmax'}}>
        {this.searches.map(({term, blurb, title}, index) => {
          var [facet, ...terms] = term.split(':')
          return <section>
            <h2>Explore <span style={{fontFamily: '"MiaGrotesk-Light",sans-serif'}}>{title}</span></h2>
            <p><Markdown>{blurb}</Markdown></p>
            <Peek
              offset={index*5}
              facet={facet}
              q={terms.join(':')}
              quiltProps={{maxRowHeight: 600}}
              directLinkTo={terms[1]}
              shuffleQuilt={true}
              />
            {clearHr}
          </section>
        })}

        {false && this.personalize()}
      <Helmet title="Explore the art" />
    </div></div>
  },


  searches: [
    {title: 'Audio', term:'_exists_:related:audio-stops', blurb:'Audio Stops are mini-podcasts that present many of Mia’s highlights and favorite artworks through sound and stories. Listen in the galleries or at home.'},
    {title: 'Video', term:'_exists_:related:videos', blurb:'Videos from the collection'},
    {title: 'Art Stories', term:'_exists_:related:artstories', blurb:'[ArtStories](https://artstories.artsmia.org/) are in-depth multimedia explorations of Mia’s highlights and hidden gems—from intriguing details to secret backstories. Available on iPads in the galleries, and optimized for your smartphone or home computer.'},
    {title: 'Mia Stories', term:'_exists_:related:stories', blurb:'[Mia Stories](https://new.artsmia.org/stories/): the museum beyond the walls, outside the frame, at the lively intersection of life and art. From behind-the-scenes buzz to inspiring connections with current events, it’s the museum in conversation.'},
    {title: 'Newsflashes', term:'_exists_:related:newsflashes', blurb: '[NewsFlashes](https://new.artsmia.org/trending-now/) connect current events and art in Mia\'s collection. You’ll also find them throughout the museum, in print form, hanging beside the art they reference.'},
    {title: '3D Models', term:'_exists_:related:3dmodels', blurb: "Mia does extensive photographic documentation of it's art, including building 3D models."},
  ],

  personalize() {
    return <div>
      <h2>Personalize Mia with new ways to explore art.</h2>

      <div>
        <img
          src="http://a2.mzstatic.com/us/r30/Purple30/v4/81/fe/1d/81fe1d69-d2dd-ef9d-a78c-44ba8b30f5fd/screen696x696.jpeg" 
          style={appThumbStyle}
        />
        <h3>Journeys</h3>
        <p>Use this app to create a personalized journey through the museum or follow the suggestions of others. Either way, we’ll map it out for you. <a href="https://itunes.apple.com/us/app/mia-journeys/id1058993004">Download the app free (iOS).</a></p>
        {clearHr}
      </div>

      <div>
        <img
          src="http://a2.mzstatic.com/us/r30/Purple30/v4/9f/29/53/9f295387-66e0-ff76-d38f-04a33422faa5/screen696x696.jpeg"
          style={appThumbStyle}
        />
        <h3>Overheard</h3>
        <p>Eavesdrop on the conversations of fictional fellow visitors as they wander the galleries, using this playful audio app. <a href="https://itunes.apple.com/us/app/overheard-mia/id1116319582">Download it free (iOS)</a>.</p>
        <ExpandableNewArtsmiaContentBlock page="overheard" />
        {clearHr}
      </div>
    </div>
  },
})

module.exports = Explore
