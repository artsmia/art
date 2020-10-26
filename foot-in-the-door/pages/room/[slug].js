/** @format */
import Layout from '../../components/Layout'
import LeftRightNav from '../../components/LeftRightNav'
import RoomGrid from '../../components/RoomGrid'
import { classifications, getSearchResults } from '../../util'
import { getImages } from '../api/imagesForCarousel'

function Room(props) {
  const { classification: _classification, results, imagesForCarousel } = props // slug
  const classification =
    _classification === '*' ? 'Foot in the Door' : _classification
  const hits = results.hits ? results.hits.hits : results // searches and random querys return differently shaped JSON

  const perPage = 33 // how many items to show per page

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  // if (router.isFallback) {
  //   return <div>Loading...</div>
  // }

  return (
    <Layout>
      <main className="md:mt-24">
        <h1 className="text-center text-5xl font-black capitalize mb-4">
          {classification}
        </h1>
        <LeftRightNav
          classifications={classifications}
          classification={classification}
          showAllAndStretch={true}
          imagesForCarousel={imagesForCarousel}
          className="mt-16 -mb-16 md:my-0"
        />
        <RoomGrid
          classification={classification}
          hits={hits}
          perPage={perPage}
          className="mt-48"
        />
      </main>
      <aside>
        <LeftRightNav
          classifications={classifications}
          classification={classification}
          className="flex justify-between mt-16"
        >
          <div className="p-8 bg-gray-200 mt-4 sm:max-w-96 sm:mx-auto sm:-mt-8">
            <JoinCTAPhrase />
            <br />
            <BecomeAMemberLink className="mt-2 inline-block text-center w-auto mx-auto" />
          </div>
        </LeftRightNav>
      </aside>
    </Layout>
  )
}

export default Room

export async function getStaticProps({ params }) {
  const { slug } = params
  let classification = slug.replace('-', ' ')
  if (classification === 'all') classification = '*'
  const results = await getSearchResults(`classification:${slug}`)
  const imagesForCarousel = await getImages(4)

  return {
    props: {
      results,
      classification,
      slug,
      imagesForCarousel,
    },
    revalidate: 600,
  }
}

export async function getStaticPaths() {
  const manifest = {
    paths: classifications.concat('*').map((classification) => {
      let slug = classification.toLowerCase().replace(' ', '-')
      if (slug === '*') slug = 'all'

      return { params: { classification, slug } }
    }),
    fallback: false,
  }

  return manifest
}
