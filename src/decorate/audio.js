/** @format
 *
 * Decorate a search by 'lifting' results with audio up to the top
 *
 * TODO
 * show controls and audio info overall play/pause, number of stops in playlist?
 * show progress while audio plays?
 * restart, skip back/forward 15 seconds?
 * better distinguish playing card from paused cards in playlist view
 * bug with autoPlay and announcing titles - it doesn't happen until card #3 (should kick inon card #2)
 * maintain audio playing when decorator window closes? … what about on page navigation?
 * linear gradient behind the play/pause icons to ensure visibility?
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

    const matchingAudioStop = hitsWithAudio.find(hit => {
      const hitAudioNumber = hit._source['related:audio-stops'][0].number
      return hitAudioNumber === term || hitAudioNumber === `0{term}`
    })

    const isAudioNumberSearchTerm = term.match(/\d{1,3}/)
    const zeroPadTerm = parseInt(term).toLocaleString('en-US', {
      minimumIntegerDigits: 3,
      useGrouping: false,
    })
    const matchingAudioWithoutArtworkConnection =
      isAudioNumberSearchTerm &&
      `http://audio-tours.s3.amazonaws.com/p${zeroPadTerm}.mp3`

    // TODOoooo - 1 and two digit audio numbers aren't caught by ES
    // when "97" is searched for, the results from ES don't include the artwork
    // with audio number "097", so it can't be lifted up into the audio bar.
    // zero-padding the term allows the audio interface to show without the artwork
    // info, which is better than nothing.
    //
    // IDEA - could searches foor single and two digit numbers be modified when going
    // into ES to `originalTerm | <0+originalTerm>`?

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
            directAudioLink={matchingAudioWithoutArtworkConnection}
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
    const { hit, hitsWithAudio, directAudioLink } = this.props
    const { showPlaylist, playNextId, errorLoadingAudioFile } = this.state

    if (!hit && directAudioLink && !errorLoadingAudioFile) {
      return (
        <audio
          src={directAudioLink}
          controls
          onError={() => {
            this.setState({ errorLoadingAudioFile: true })
          }}
        />
      )
    }

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

    const isPaused = this.audio ? this.audio.paused : true

    const pausedIconSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 0c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zm-2-10l6 3.5-6 3.5z"/></svg>`
    const playIconSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 0c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zm-3-9.5h2v6h-2zm4 0h2v6h-2z"/></svg>`
    const maskSvg = !!isPaused ? pausedIconSvg : playIconSvg

    const playIconMask = (
      <div
        style={{
          WebkitFilter: 'drop-shadow(1px 1px 4px rgba(0, 0, 0, 0.75))',
        }}
      >
        <div
          style={{
            WebkitMaskImage: `url('${maskSvg}')`,
            display: 'inline-block',
            width: '30%',
            height: '30%',
            content: "''",
            color: '#666',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            backgroundColor: '#eee',
            padding: '0 5px 0 0',
            opacity: '0.9',
            position: 'absolute',
            bottom: '5%',
            left: '2%',
            pointerEvents: 'none',
          }}
        />
      </div>
    )

    return (
      <div>
        <figure className="audioClip" style={{ maxWidth: '71%' }}>
          <div style={{ position: 'relative' }}>
            <Image
              art={art}
              style={{ maxWidth, maxHeight }}
              onClick={this.playPause}
              // onMouseEnter={() => this.setState({ imageHovered: true })}
              // onMouseLeave={() => this.setState({ imageHovered: false })}
            />
            {playIconMask}
          </div>
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
              visibility: this.audio && isPaused ? 'hidden' : 'visible',
              visibility: 'hidden',
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

    if (!this.props.autoPlay) {
      audio.play()
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

  playPause(evt) {
    const { audio } = this
    audio && audio.paused ? audio.play() : audio.pause()
    this.setState(prevState => prevState)
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
