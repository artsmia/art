var React = require('react')
var {Link} = require('react-router')
var rest = require('rest')

const ArtistPage = require('../artist')

var ArtistDecorator =  React.createClass({
  componentWillMount() {
    const artistName = decodeURIComponent(this.props.artist[0].split(':')[1])
      .replace('+', ' ').replace(/"/g, '')
    console.info('ArtistDecorator', {artistName, key: this.props.key})
    const fetchArtist = ArtistPage.fetchData.artist
    fetchArtist({id: artistName}).then(artist => {
      console.info('fetchArtist', {artist, artistName})
      this.setState({artist, error: !artist})
    })
  },

  render() {
    const {artist, error} = this.state || {}
    if(error || artist && !artist.q) {
      // If artist data can't be fetched, retroactively remove this Decorator
      // from consideration with a callback and render nothing for now.
      this.props.remove && this.props.remove('ArtistDecorator')
      return <span />
    }
    if(!artist) return <span>loading…</span>

    const {thumbnail, link, extract} = artist.wikipedia || {}
    const {artistDescription} = artist.wikidata || {}

    return <div style={{maxWidth: '47em', margin: '0 auto'}} key={this.props.terms}>
      {thumbnail && <img src={thumbnail} style={{float: 'right', margin: '0 0 1em 1em', maxHeight: 200}} alt={`image of ${artist.name} from wikipedia`}/>}
      <h2 style={{color: "#232323"}}>{artist.name}</h2>
      {extract ? <p>
        {extract}
      </p> : artistDescription && <p>
        {artistDescription}
      </p>}
      <p><a href={`/people/${artist.id}`}>More info &rarr;</a></p>
    </div>
  }
})

module.exports = ArtistDecorator

