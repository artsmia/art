/** @format */
import { useRouter } from 'next/router'

import Survey from '../components/Survey'

export default function SurveyPage() {
  const {
    query: { simulatePopup },
  } = useRouter()

  return <Survey isPopup={simulatePopup} />
}
