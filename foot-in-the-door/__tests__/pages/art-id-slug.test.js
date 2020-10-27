/** @format */
import { getServerSideProps } from '../../pages/art/[id]/[[...slug]]'

// TODO move these into a `mocks` file?
// prettier-ignore
let artworkFetchMocks = {
  31: {"id":31,"accession_number":"L2020.FITD.30","creditline":"likewise","title":"Leo's Bad Hair Day","artist":"Kent Olson","keywords":"wood, basswood, flat-plane carving,","description":"This is a wood carving of Leo standing in the wind with his comb-over hair being blown off his bald head.  He is holding a walking staff and looking off in the direction of the wind.","dimension":"7 x 2 x 2","classification":"Sculpture","image":"2020_fitd_2020-09-08T15:12:24_Kent-Olson.jpg","public_access":1,"image_width":4032,"image_height":3024},
  1257: {"id":1257,"accession_number":"L2020.FITD.1256","creditline":"likewise","title":"Minnehaha Falls - Winter","artist":"Harison Wiesman","keywords":"","description":"A painting of an icy blue waterfall frozen over in the winter. The ice is peeking out from behind barren brown trees and ever-green bushes while a dusting of snow coats the ground. A cloudy light-gray sky hangs overhead.","dimension":"6 1/16\" x 9 1/6\"","classification":"Paintings","image":"2020_fitd_2020-09-22T23:10:15_Harison-Wiesman.jpg","public_access":1,"image_width":2000,"image_height":2000},
}
artworkFetchMocks['M5o'] = artworkFetchMocks[1257]

global.fetch = jest.fn((url) => {
  const match = url.match(/id\/(.*)\?/)
  const id = match && match[1]

  return Promise.resolve({
    json: () => Promise.resolve(id ? artworkFetchMocks[id] : { mock: '1' }),
  })
})

describe('test getSSP', () => {
  test('juggles numeric and hashid IDs correctly', async () => {
    const { unstable_redirect: redirect31 } = await getServerSideProps({
      params: { id: 31 },
    })
    expect(redirect31.destination).toMatch(
      '/art/4p/leos-bad-hair-day-kent-olson'
    )

    const { unstable_redirect: redirect1257 } = await getServerSideProps({
      params: { id: '1257' },
    })
    expect(redirect1257.destination).toMatch(
      '/exhibitions/2760/foot-in-the-door/art/M5o/minnehaha-falls-winter-harison-wiesman'
    )
    const { unstable_redirect: redirectM5o } = await getServerSideProps({
      params: { id: 'M5o' },
    })
    expect(redirectM5o.destination).toMatch(
      '/exhibitions/2760/foot-in-the-door/art/M5o/minnehaha-falls-winter-harison-wiesman'
    )
  })
})
