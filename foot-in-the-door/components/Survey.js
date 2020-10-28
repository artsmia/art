/** @format */
import { useState, useEffect, useRef } from 'react'

import styles from './Survey.module.css'
import { cx, updateSurvey } from '../util'

function Survey(props) {
  const [surveyData, setSurveyData] = useState({})
  const givenAnswers = surveyData.data
  const [formIsValid, setFormIsValid] = useState(false)
  const formRef = useRef(null)
  const { accepted, rejected } = givenAnswers || {}
  const { isPopup } = props

  useEffect(() => {
    async function getInitialSurveyData() {
      const response = await fetch(
        'https://search.artsmia.org/survey/foot-in-the-door-visit',
        { credentials: 'include' }
      )
      const data = await response.json()

      setSurveyData(data)
    }

    getInitialSurveyData()
  }, [])

  function handleChange(event) {
    const {
      target: {
        name,
        labels: [
          {
            textContent: text,
            firstChild: { checked },
          },
        ],
        value,
        // labels: domLabels,
      },
      target,
    } = event

    // const labels = [...domLabels].map((label) => label.textContent)

    let thisAnswer
    if (text && typeof checked === 'boolean') {
      if (target.type === 'radio') {
        // for radios, just change to text
        thisAnswer = text
      } else {
        // for checkboxes, based on `checked`, either add or
        // remove the given answer
        const existingAnswers = givenAnswers[name] || []
        thisAnswer = checked
          ? [...existingAnswers, text]
          : existingAnswers.filter
          ? existingAnswers.filter((answer) => answer !== text)
          : existingAnswers
      }
    } else {
      // for single-value inputs, pass the value
      thisAnswer = value
    }

    const nextAnswers = {
      ...givenAnswers,
      [name]: thisAnswer,
    }

    updateAnswers(nextAnswers)

    // For items with an `output` element as their sibling, update
    // the output to reflect the input's current value
    const { nextElementSibling } = target
    if (nextElementSibling && nextElementSibling.type === 'output') {
      nextElementSibling.innerText = value
    }
  }

  function updateAnswers(data) {
    setSurveyData({
      ...surveyData,
      data: {
        ...givenAnswers,
        ...data,
      },
    })
  }

  /**
   * update when answers are changed
   *
   * TODO
   *
   * sniff out incognito mode browsers or where cookies
   * are disabled. Message that cookies are required and wait
   * to show the survey
   *
   * debounce valid save calls
   * move logic into `updateSurvey`?
   */
  useEffect(() => {
    async function saveSurveyData() {
      await updateSurvey(JSON.stringify(givenAnswers))
    }

    const hasAnswers = givenAnswers && Object.keys(givenAnswers).length > 0
    if (hasAnswers) saveSurveyData()

    // use html5's native form validity API to enable/disable submit button
    setFormIsValid(formRef?.current?.checkValidity())
  }, [givenAnswers])

  /** Show an intro screen if this is a popup,
   * asking the visitor to accept or reject the survey.
   * If accepted, move to the survey questions,
   * if rejected, fade away.
   */
  function acceptSurvey() {
    updateAnswers({ accepted: new Date() })
  }
  function rejectSurvey() {
    updateAnswers({ rejected: new Date() })
  }
  if (isPopup && !(accepted || rejected)) {
    return (
      <aside className={cx(styles.survey, 'prose')}>
        <h2>Please take our 5 question survey</h2>
        <p>
          Would you be able to answer three quick questions to help us improve
          your experience?
        </p>

        <button onClick={acceptSurvey}>Ya, sure</button>
        <button onClick={rejectSurvey}>No thanks</button>
      </aside>
    )
  }

  return (
    <form id="survey" className={cx(styles.survey, 'prose')} ref={formRef}>
      <ol className={styles.questions}>
        {questions.map(({ q, answers, id, type, siblings, ...inputProps }) => {
          const answerGiven = (givenAnswers && givenAnswers[id]) || []
          return (
            <li key={id} className="question">
              <h3>{q}</h3>
              {answers && answers.map ? (
                answers.map((a) => {
                  const isChosen =
                    Boolean(answerGiven) &&
                    (a === answerGiven || (answerGiven || []).indexOf(a) > -1)

                  return (
                    <label key={a} className="block">
                      <input
                        type={type}
                        name={id}
                        onChange={handleChange}
                        checked={isChosen}
                        required={!answerGiven.length}
                      />
                      {a}
                    </label>
                  )
                })
              ) : (
                <label className="block">
                  <input
                    type={type}
                    name={id}
                    {...inputProps}
                    onChange={handleChange}
                    defaultValue={answerGiven}
                    required={!answerGiven.length}
                  />
                  {siblings}
                </label>
              )}
            </li>
          )
        })}
      </ol>

      {!formIsValid && (
        <p className="">
          Make sure you&rsquo;ve filled in all the questions above
        </p>
      )}
      <button
        disabled={!formIsValid}
        onClick={() => updateAnswers({ completed: new Date() })}
      >
        Submit
      </button>
      <button>Cancel</button>
    </form>
  )
}

export default Survey

const questions = [
  {
    q:
      'What made you decide to take a look through the Foot in the Door Exhibition? Select all that apply.',
    id: 'purpose',
    answers: `I usually visit Mia’s special exhibitions
Just exploring because I like art. 
I miss visiting Mia in person.
I have artwork in this exhibition
I know one of the artists.`.split('\n'),
    type: 'checkbox',
  },
  {
    q:
      'How would you describe your experience viewing this exhibition? Select all that apply.',
    id: 'experience',
    answers: `Learned or experienced something new
Experienced artworks or performances, or specific performers
Had fun
Relaxed or felt less stressed
Felt creative or creatively inspired
Escaped the stress of the real world
Broadened my perspective or worldview
Felt transported to another place or time`.split('\n'),
    type: 'checkbox',
  },
  {
    q: 'How frequently do you visit Mia in person?',
    id: 'visit-frequency',
    answers: `I have never visited Mia in person
Every few years
Once or twice a year
Many times a year`.split('\n'),
    type: 'radio',
  },
  {
    q: 'Where are you visiting from? (please enter your zip code or country)',
    id: 'location',
    type: `textarea`,
  },
  {
    q:
      'How likely is it that you would recommend this exhibition to a friend or a colleague?',
    id: 'recommend',
    type: 'range',
    min: 0,
    max: 7,
    step: 1,
    siblings: <output htmlFor="recommend" className="pl-2 -mt-1" />,
  },
  {
    q:
      'How did you hear about this virtual exhibition? (select all that apply)',
    id: 'hear',
    answers: `Mia email
Mia website
Social media
Newspaper advertisement
Radio`.split('\n'),
    type: 'checkbox',
  },
]
