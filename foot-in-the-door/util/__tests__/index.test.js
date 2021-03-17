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
  ['Todd Webb In Africa: Outside The Frame', 'Todd Webb In Africa'],
  [
    '"Rhodesia And Nyasaland In Brief" Informational Brochure',
    'Rhodesia And Nyasaland In Brief',
    '"',
    '" Informational Brochure',
  ],
  [
    '“Magadiscio [Sic], Somaliland, A Continent Awakes,” UN Information Services PR Photograph',
    'Magadiscio',
    '“', // prefix
    ' [Sic], Somaliland, A Continent Awakes,” UN Information Services PR Photograph', // suffix
  ],
  ['(Procession Of Oxen)', 'Procession Of Oxen', '(', ')'],
  [
    'Piotr Szyhalski / Labor Camp | COVID-19: Labor Camp Report',
    'Piotr Szyhalski / Labor Camp',
    '', // no prefix
    ' | COVID-19: Labor Camp Report'
  ],
  // TODO leading `(` should become prefix, THEN segment the resulting title?
  // [
  //   '(Writing Box Decorated With Maple Tree And Deer In The Style Of Hon’ami Kōetsu)',
  //   'Writing Box',
  //   '(',
  //   'Decorated With Maple Tree And Deer In The Style Of Hon’ami Kōetsu)',
  // ],
  // TODO prioritize quoted phrase over all other rules?
  // [
  //   'Cover Image, “United Nations Photos, Supplement No. 7,” United Nations Office Of Public Information',
  //   'United Nations Photos, Supplement No. 7',
  //   'Cover Image, “',
  //   ',” United Nations Office Of Public Information',
  // ],
]

describe('segment artwork titles', () => {
  titles.map(([full, expectedMainTitle, expectedPrefix, expectedSuffix]) => {
    test(full, () => {
      const [prefix, mainTitle, suffix] = segmentTitle(full, {
        returnJSX: false,
      })

      expect(mainTitle).toEqual(expectedMainTitle)
      if (expectedPrefix) expect(prefix).toEqual(expectedPrefix)
      if (expectedSuffix?.length > 0) expect(suffix).toEqual(expectedSuffix)
      //
      // TODO how to test `returnJSX: true`?
    })
  })
})
