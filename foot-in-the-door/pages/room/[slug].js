/** @format */
import Link from 'next/link'

import Layout from '../../components/Layout'
import RoomGrid from '../../components/RoomGrid'
import { getSearchResults } from '../../util'

function Room(props) {
  const { classification, results } = props // slug
  const hits = results.hits ? results.hits.hits : results // searches and random querys return differently shaped JSON

  const perPage = 13 // how many items to show per page

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  // if (router.isFallback) {
  //   return <div>Loading...</div>
  // }

  const _cls = classifications.map((c) => c.toLowerCase())
  const roomIndex = _cls.indexOf(classification)
  const prevRoom = _cls[(roomIndex - 1) % _cls.length] || 'mixed media' // how does math work again?! wrapping around would be better than `undefined || const`
  const nextRoom = _cls[(roomIndex + 1) % _cls.length]

  return (
    <Layout>
      <main>
        <h1 className="text-center text-5xl font-black capitalize">
          {classification}
        </h1>
        <p className="mt-4 text-center">…</p>
        <nav className="flex justify-between mb-64">
          <Link href={`/room/${prevRoom.replace(' ', '-')}`}>
            <a className="uppercase">&larr; {prevRoom}</a>
          </Link>
          <Link href={`/room/${nextRoom.replace(' ', '-')}`}>
            <a className="uppercase">{nextRoom} &rarr;</a>
          </Link>
        </nav>
        <RoomGrid
          classification={classification}
          hits={hits}
          perPage={perPage}
        />
      </main>
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

const classifications = [
  'Ceramics',
  'Paintings',
  'Photography',
  'Drawings',
  'Prints',
  'Sculpture',
  'Textiles',
  'Mixed Media',
]

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
