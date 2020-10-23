/** @format */
import Layout from '../../components/Layout'
import LeftRightNav from '../../components/LeftRightNav'
import RoomGrid from '../../components/RoomGrid'
import { classifications, getSearchResults } from '../../util'
import { getImages } from '../api/imagesForCarousel'

function Room(props) {
  const { classification, results, imagesForCarousel } = props // slug
  const hits = results.hits ? results.hits.hits : results // searches and random querys return differently shaped JSON

  const perPage = 33 // how many items to show per page

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  // if (router.isFallback) {
  //   return <div>Loading...</div>
  // }

  return (
    <Layout>
      <main>
        <h1 className="text-center text-5xl font-black capitalize">
          {classification}
        </h1>
        <LeftRightNav
          classifications={classifications}
          classification={classification}
          showAllAndStretch={true}
          imagesForCarousel={props.imagesForCarousel}
        />
        <RoomGrid
          classification={classification}
          hits={hits}
          perPage={perPage}
          className="mt-64"
        />
      </main>
      <aside>
        <LeftRightNav
          classifications={classifications}
          classification={classification}
          className="flex justify-between mt-16"
        ></LeftRightNav>
      </aside>
    </Layout>
  )
}

export default Room

export async function getStaticProps({ params }) {
  const { slug } = params
  const classification = slug.replace('-', ' ')
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
    paths: classifications.map((classification) => {
      const slug = classification.toLowerCase().replace(' ', '-')

      return { params: { classification, slug } }
    }),
    fallback: false,
  }

  return manifest
}
