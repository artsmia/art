/** @format */
import { useRouter } from 'next/router'

import Survey from '../components/Survey'

function SurveyPage() {
  const {
    query: { simulatePopup },
  } = useRouter()

  return (
    <Survey
      isPopup={simulatePopup}
      className={simulatePopup ? '' : 'mt-6 mx-auto px-2'}
    />
  )
}

export default SurveyPage
