var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')
var Helmet = require('react-helmet')
var R = require('ramda')

var Person = require('./artist')
var searchEndpoint = require('./endpoints').search

const definedGroups = {
  'black-history-month': `Alfred%20Eisenstaedt,Beauford%20Delaney,Benny%20Andrews,Betye%20Saar,Bob%20Thompson,Carl%20Robert%20Pope,%20Jr.,Carrie%20Mae%20Weems,Charles%20Gaines,Charles%20White,Clarence%20Morgan,Clementine%20Hunter,David%20Levinthal,Elizabeth%20Catlett,Emma%20Amos,Frank%20E.%20Cummings%20III,Frank%20J.%20Brown,Fred%20McDarrah,Fred%20Wilson,Glenn%20Ligon,Gordon%20Parks,Gwendolyn%20Knight,Henry%20Bannarn,Henry%20Ray%20Clark,Iona%20Rozeal%20Brown,Jacob%20Lawrence,James%20Van%20Der%20Zee,John%20Biggers,John%20Dowell,John%20Moore,John%20Woodrow%20Wilson,Jules%20Lion,Julie%20Mehretu,Kara%20Walker,Kehinde%20Wiley,Kerry%20James%20Marshall,Laylah%20Ali,Leslie%20Hewitt,Lois%20Mailou%20Jones,Lonnie%20Holley,Lorna%20Simpson,Lorraine%20O'Grady,Mark%20Bradford,Martin%20Puryear,Mary%20Lee%20Bendolph,McArthur%20Binion,Melvin%20Edwards,Mequitta%20Ahuja,Mickalene%20Thomas,Minnie%20Evans,Mitchell%20Squire,Nick%20Cave,Paul%20Anthony%20Smith,Purvis%20Young,Reginald%20Sanders,Renée%20Stout,Richard%20Hunt,Rico%20Gatson,Robert%20Scott%20Duncanson,Romare%20Howard%20Bearden,Roy%20DeCarava,Russell%20T.%20Gordon,Sam%20Gilliam,Sanford%20Biggers,Sedrick%20Huckaby,Shinique%20Smith,Thorton%20Dial,Todd%20Gray,Vincent%20D.%20Smith,Wadsworth%20Jarrell,William%20Edmondson,William%20Howard,Willie%20Cole`
}

var People = React.createClass({
  statics: {
    fetchData: {
      artists: (params, existingData) => {
        const artistIds = (definedGroups[params.ids] || params.ids).split(',')
        return Promise.all(artistIds.map(id => rest(`${searchEndpoint}/people/${id}`)))
          .then(values => values.map(({entity}) => {
            return JSON.parse(entity)
          }))
      },
    }
  },

  render() {
    const artists = this.props.data.artists.filter(artist => artist && artist.id)
    const smallScreen = window.innerWidth < 666

    return <div>
      <div style={{background: '#232323', height: '7em', width: '100%'}} />

      <div style={!smallScreen ? {left: '53vw', position: 'fixed', marginTop: '1em'} : {}}>
        <ul>{artists.map(artist => <li style={{display: 'inline-block', padding: '0 1em'}}>
          <a href={`#${artist.name}`}>{artist.name}</a>
        </li>)}</ul>
      </div>

      <div style={{marginLeft: '0%', maxWidth: '50%', zIndex: 6, backgroundColor: 'white'}}>
        {artists.map((artist, index) => <section>
          <a id={artist.name} style={{paddingBottom: '3em', display: 'block'}}></a>
          <Person
            data={{artist}}
            key={artist.id}
            hideHeader={true}
          />
        </section>)}
      </div>
    </div>
  },
})

module.exports = People

