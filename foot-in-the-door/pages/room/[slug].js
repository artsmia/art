/** @format */
import Layout from '../../components/Layout'
import LeftRightNav from '../../components/LeftRightNav'
import RoomGrid from '../../components/RoomGrid'
import { classifications, getSearchResults } from '../../util'

function Room(props) {
  const { classification, results } = props // slug
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
        <p className="mt-4 text-center">…</p>
        <LeftRightNav
          classifications={classifications}
          classification={classification}
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
        >
          <p className="bg-gray-200 p-4">Membership/Donate callout goes here</p>
        </LeftRightNav>
      </aside>
    </Layout>
  )
}

export default Room

export async function getStaticProps({ params }) {
  const { slug } = params
  const classification = slug.replace('-', ' ')
  console.info('getStaticProps', { classification, slug, params })
  const results = await getSearchResults(`classification:${slug}`)

  return {
    props: {
      results,
      classification,
      slug,
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

  console.info('getStaticPaths', JSON.stringify(manifest, null, 2))
  return manifest
}
