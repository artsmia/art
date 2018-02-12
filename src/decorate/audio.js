/** @format
 *
 * Decorate a search by 'lifting' results with audio up to the top
 *
 * TODO
 * show controls and audio info overall play/pause, number of stops in playlist?
 * next/prev?
 * play a "that's all" speech synthesis at the end of the playlist?
 */

var React = require('react')

const Image = require('../image')
var { getFacetAndValue } = require('../artwork/creator')

var AudioDecorator = React.createClass({
  render() {
    const term = this.props.term[0]
    const hits = this.props.hits

    const hitsWithAudio =
      hits && hits.filter(hit => hit._source['related:audio-stops'])

    const matchingAudioStop = hitsWithAudio.find(
      hit => hit._source['related:audio-stops'][0].number === term
    )

    const otherHitsWithAudio = hitsWithAudio.filter(
      hit => hit !== matchingAudioStop
    )

    if (!hits || (!matchingAudioStop && !otherHitsWithAudio)) return <span />

    return (
      <div
        className="decorator audio"
        style={{ overflow: 'scroll', maxWidth: '100%' }}
      >
        {(matchingAudioStop || otherHitsWithAudio) && (
          <AudioStopLifter
            hit={matchingAudioStop}
            hitsWithAudio={otherHitsWithAudio}
            forceSearchUpdate={this.props.forceSearchUpdate}
          />
        )}
      </div>
    )
  },
})

/**
 * 'Lifts' a lower search result into featured position - here an audio stop
 * whose stop number directly matches what was typed into the search, but may not
 * be the first result returned by ES
 *
 * IDEA could we lift all audio stops from a search result to show them in a horizontal scroller?
 * so a search for 'horse' would cue up a playlist of horse-themed audio?
 * blog the sequence of recreating our old audio stop finder and morphing it into a 'player'?
 */
const AudioStopLifter = React.createClass({
  getInitialState() {
    return {
      playing: false,
      playingId: this.props.hit || this.props.hitsWithAudio[0],
      played: [],
      playNext: undefined,
      showPlaylist: false,
    }
  },

  render() {
    const { hit, hitsWithAudio } = this.props
    const { showPlaylist, playNextId } = this.state

    if (!hit && hitsWithAudio.length === 0) return <span />

    const playlist = [hit, ...hitsWithAudio].filter(id => id)

    const audioCardProps = {
      handlePlayStart: this.handlePlayStart,
      handlePlayEnd: this.handlePlayEnd,
      forceSearchUpdate: this.props.forceSearchUpdate,
      playingId: this.state.playingId,
      playing: this.state.playing,
    }

    const audioCards =
      hit && !showPlaylist ? (
        <AudioCard
          hit={hit || hitsWithAudio[0]}
          forceSearchUpdate={this.props.forceSearchUpdate}
          {...audioCardProps}
        />
      ) : (
        playlist.map((_hit, index) => {
          const shouldAutoPlay = playNextId
            ? this.state.playNextId === _hit._id
            : false && index === 0

          return (
            <AudioCard
              hit={_hit}
              directMatch={hit === _hit}
              key={_hit._id}
              autoPlay={shouldAutoPlay}
              {...audioCardProps}
            />
          )
        })
      )

    const playlistToggler = (
      <button onClick={() => this.setState({ showPlaylist: !showPlaylist })}>
        toggle playlist
      </button>
    )

    return (
      <div
        style={{ display: 'flex', flexDirection: 'row', marginLeft: 'auto' }}
      >
        {audioCards}
        {hit && hitsWithAudio.length > 1 && playlistToggler}
      </div>
    )
  },

  handlePlayStart(art) {
    this.setState({ playing: true, playingId: art.id })
  },

  handlePlayEnd(endedStopArt) {
    const { hit, hitsWithAudio } = this.props
    const playlist = [hit, ...hitsWithAudio].filter(id => id)
    const endedIndex = playlist.findIndex(t => endedStopArt.id === t._id)
    const nextTrack = playlist[endedIndex + 1]

    this.setState({
      playNextId: nextTrack && nextTrack._id,
      playingId: nextTrack && nextTrack._id,
      played: this.state.played.concat(endedStopArt.id),
    })

    if (!nextTrack) {
      // TODO speak indication of the end of the playlist?
    }
  },
})

const AudioCard = React.createClass({
  getInitialState() {
    return { imageHovered: false }
  },

  render() {
    const { imageHovered } = this.state
    const {
      hit,
      handlePlayStart,
      handlePlayEnd,
      autoPlay,
      forceSearchUpdate,
    } = this.props

    const art = hit && hit._source
    const audio = art['related:audio-stops'][0]

    const baseWidth = 300
    const baseHeight = 150
    const maxWidth = imageHovered ? baseWidth * 2 : baseWidth
    const maxHeight = imageHovered ? baseHeight * 2 : baseHeight

    const fav = getFacetAndValue(art)
    const artCreator = fav && fav[1] ? fav[1].split(';')[0] : ''

    return (
      <div>
        <figure className="audioClip" style={{ maxWidth: '71%' }}>
          <Image
            art={art}
            style={{ maxWidth, maxHeight }}
            onClick={this.playPause}
            // onMouseEnter={() => this.setState({ imageHovered: true })}
            // onMouseLeave={() => this.setState({ imageHovered: false })}
          />
          <figcaption>
            <p>
              <strong>{art.title}</strong>, <em>{artCreator}</em> #{
                audio.number
              }
            </p>
          </figcaption>
          <audio
            style={{
              maxWidth: '100%',
              visibility:
                this.audio && this.audio.paused ? 'hidden' : 'visible',
            }}
            src={audio.link.replace('http:', 'https:')}
            controls
            onPlay={this.handlePlay}
            onEnded={() => handlePlayEnd(art)}
            onError={() => {
              console.error(
                'TODO handle when audio file isnt on s3 - error playing audio for',
                art
              )
              handlePlayEnd(art)
            }}
            ref={audio => {
              this.audio = audio
            }}
          />
        </figure>
      </div>
    )
  },

  // TODO only allow one card to play at a a time
  componentDidUpdate() {
    const audio = this.audio
    const { hit } = this.props
    const art = hit._source

    if (audio && this.props.autoPlay && audio.currentTime === 0) {
      audio.scrollIntoViewIfNeeded()
      audio.play()
    }

    if (!audio.paused && this.props.playingId !== art.id) audio.pause()
  },

  handlePlay() {
    const { audio } = this
    const art = this.props.hit._source
    this.props.forceSearchUpdate(this.props.hit)
    this.props.handlePlayStart(art)

    if (audio.currentTime > 0) {
      audio.volume = 1
      return
    }

    // if just starting, speak the artwork title over the audio stop
    // and then reset to play audio from beginning
    const prevVolume = audio.volume
    const prevTime = audio.currentTime
    audio.volume = 0
    audio.playbackRate = 0.1
    this.speakAudioIntroduction()

    const restartAudioPlaying = () => {
      const needleTime = prevTime === 0 ? 0.001 : prevTime
      audio.playbackRate = 1
      audio.volume = prevVolume
      audio.currentTime = needleTime
    }

    const delayAudioStopWhileSpeaking = (count = 1) => {
      setTimeout(() => {
        speechSynthesis.pending || speechSynthesis.speaking
          ? delayAudioStopWhileSpeaking(count + 1)
          : setTimeout(restartAudioPlaying, 300)
      }, 100 * count)
    }

    delayAudioStopWhileSpeaking()
  },

  playPause() {
    const { audio } = this
    audio && audio.paused ? audio.play() : audio.pause()
  },

  speakAudioIntroduction() {
    const art = this.props.hit._source
    const fav = getFacetAndValue(art)
    const artCreator = fav && fav[1] ? fav[1].split(';')[0] : ''

    if (
      'speechSynthesis' in window &&
      window.speechSynthesis.getVoices().length > 0
    ) {
      const sp = window.speechSynthesis
      const speakArtworkInfo = new SpeechSynthesisUtterance()
      const artworkIntro = [art.title.replace(/<\/?i>/g, ''), artCreator].join(
        ' '
      )
      speakArtworkInfo.text = artworkIntro
      sp.speak(speakArtworkInfo)
    }
  },
})

module.exports = AudioDecorator
