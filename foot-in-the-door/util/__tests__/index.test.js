/** @format */

import { segmentTitle } from '../index'

const titles = [
  ['Untitled, (44UN-58-075), Northern Rhodesia (Zambia)', 'Untitled'],
  [
    'Drawing Given To Todd Webb By A Student At The Vocational School In Salisbury, Rhodesia (Harare, Zimbabwe)',
    'Drawing Given To Todd Webb By A Student',
  ],
  [
    'The "Ever Young" Studio In The James Town Neighbourhood, Accra',
    'The "Ever Young" Studio',
  ],
]

describe('segment artwork titles', () => {
  titles.map(([full, expectedFirstSegment]) => {
    test(full, () => {
      const segments = segmentTitle(full, { returnJSX: false })

      expect(segments[0]).toEqual(expectedFirstSegment)
      // TODO how to test `returnJSX: true`?
    })
  })
})
