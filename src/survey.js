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
  searchQuery: 'room:G* image:valid public_access:1',
  preloadNext: true,
})

var ArtworkSurvey = React.createClass({
  render() {
    var thanksMessage = <div>
      <p>
        Thanks for helping Mia visitors make new connections to diverse artworks.
      </p>
      <p>
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

var VisitorSurvey = React.createClass({
  componentDidMount() {
    restWithCorsCookies(`${SEARCH}/survey/getUser`)
    this.props.toggleAppHeader()
  },

  getInitialState() {
    return {
      accepted: false,
      questions: [
        {
          q: "What are you here to look for? I am…",
          id: 'porpoise',
          answers: [
            "preparing for a visit.",
            "looking for detailed information on a specific artwork at Mia.",
            "looking for more information about an artist or type of art.",
            "just exploring because I like art."
          ],
        },
        {
          q: "I am on a...",
          id: 'device',
          answers: [
            "mobile device or tablet.",
            "laptop/desktop computer.",
          ],
        },
        {
          q: "I got here from…",
          id: 'source',
          answers: [
            "Mia’s homepage.",
            "a post from social media.",
            "a search engine.",
          ]
        }
      ],
    }
  },

  render() {
    const interactivePopup = true

    return <section style={{padding: '1em'}}>
      {this.state.completed
        ? this.surveyThanks()
        : this.state.accepted 
          ? this.buildQuizTree()
          : this.surveyWelcome()}
    </section>
  },

  stringQuiz() {
    return this.state.questions.map(q => `${q.q}\n${q.answers.map(a => `* ${a}`).join("\n")}`)
      .join("\n\n")
  },

  surveyWelcome() {
    const buttonStyle = {
      backgroundColor: '#232323',
      padding: '1em',
      fontSize: '1em',
    }

    return <section>
      <h2><strong>Hi</strong>, we're glad you are here.</h2>
      <hr />
      <p>Would you mind answering three quick questions to help us improve your experience?</p>

      <p style={{marginTop: '1em'}}><button onClick={() => this.setState({accepted: true})} style={buttonStyle}>Yes</button></p>
      <p><a onClick={this.cancelSurvey}>No thanks.</a></p>
    </section>
  },

  cancelSurvey() {
    window.parent.postMessage('cancel', '*')
    // TODO post to the server and write a 'survey complete/cancelled cookie
  },

  completeSurvey(delay=0) {
    console.info('completeSurvey')
    this.setState({completed: true})
    setTimeout(() => window.parent.postMessage('complete', '*'), delay)
    // TODO post to the server and write a 'survey complete/cancelled cookie
  },

  surveyThanks() {
    const buttonStyle = {
      backgroundColor: '#232323',
      padding: '1em',
      fontSize: '1em',
    }

    return <section>
      <h2>Thank you</h2>
      <hr />
      <p>Your candid feedback will help us improve how people experience our website.</p>

      <p><button onClick={this.completeSurvey} style={buttonStyle}>Close</button></p>
    </section>
  },

  buildQuizTree() {
    const buttonStyle = {
      backgroundColor: '#232323',
      padding: '1em',
      fontSize: '1em',
    } // ugh

    return <div>
      {this.state.questions.map(q => {
        return <div style={{display: 'block', marginBottom: '1em'}}>
          <p style={{fontWeight: 'bold'}}>{q.q}</p>
          {q.answers.map(a => {
            return <label style={{display: 'block'}}>
              <input type='radio' name={q.id} onChange={this.selectionMade}/>
              {a}
            </label>
          })}
        </div>
      })}

      <button style={buttonStyle} onClick={() => this.completeSurvey(9000)}>Submit</button>
    </div>
  },

  selectionMade(event) {
    this.setState({
      answers: {
        ...this.state.answers || {},
        [event.target.name]: event.target.labels[0].textContent,
      }
    })
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.answers !== prevState.answers) {
      const {answers} = this.state
      // console.info('post new answers', {answers, prev: prevState.answers})

      restWithCorsCookies(`${SEARCH}/survey/redesign?data=${JSON.stringify(answers)}`).then((result) => {
        // console.info('answers posted', {entity: result.entity, result})
      })
    }
  },
})

/** TODO
 *
 * paramaterize survey rendering so we can have different surveys!
 */
var Survey = React.createClass({
  render() {
    const { surveyId } = this.props.params

    if(surveyId && surveyId == '2019-visitor-quiz' || surveyId === '2019-survey') {
      return <VisitorSurvey {...this.props} />
    }

    return <ArtworkSurvey {...this.props} />
  }
})

module.exports = Survey

