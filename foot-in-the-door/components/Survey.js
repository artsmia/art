/** @format */
import { useState, useEffect } from 'react'

import styles from './Survey.module.css'
import { updateSurvey } from '../util'

function Survey() {
  const [givenAnswers, setAnswers] = useState({})

  useEffect(() => {
    async function getInitialSurveyData() {
      const response = await fetch(
        'https://search.artsmia.org/survey/foot-in-the-door-visit',
        { credentials: 'include' }
      )
      const data = await response.json()

      setAnswers(data.data)
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
      thisAnswer = value
    }

    const nextAnswers = {
      ...givenAnswers,
      [name]: thisAnswer,
    }

    setAnswers(nextAnswers)

    const { nextElementSibling } = target
    if (nextElementSibling && nextElementSibling.type === 'output') {
      nextElementSibling.innerText = value
    }
  }

  useEffect(() => {
    async function saveSurveyData() {
      await updateSurvey(JSON.stringify(givenAnswers))
    }

    const hasAnswers = Object.keys(givenAnswers).length > 0
    // TODO debounce this to 5 seconds?
    if (hasAnswers) saveSurveyData()
  }, [givenAnswers])

  return (
    <form id="survey" className={[styles.survey, 'prose'].join(' ')}>
      <h2>Please take our 5 question survey</h2>
      <ol className={styles.questions}>
        {questions.map(({ q, answers, id, type, siblings, ...inputProps }) => {
          return (
            <li key={id} className="question">
              <h3>{q}</h3>
              {answers && answers.map ? (
                answers.map((a) => {
                  const isChosen =
                    Boolean(answers) &&
                    givenAnswers &&
                    (a === givenAnswers[id] ||
                      (givenAnswers[id] || []).indexOf(a) > -1)

                  return (
                    <label key={a} className="block">
                      <input
                        type={type}
                        name={id}
                        onChange={handleChange}
                        checked={isChosen}
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
                    defaultValue={givenAnswers[id]}
                  />
                  {siblings}
                </label>
              )}
            </li>
          )
        })}
      </ol>
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
