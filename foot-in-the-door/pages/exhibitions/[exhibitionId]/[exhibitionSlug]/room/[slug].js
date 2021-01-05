/** @format */
import { useEffect, useState } from 'react'

import Layout from 'components/Layout'
import LeftRightNav from 'components/LeftRightNav'
import RoomGrid from 'components/RoomGrid'
import { classifications, getSearchResults, getImages } from 'util/index'
import { SupportCTA } from 'components/NavBar'

function Room(props) {
  const {
    classification: _classification,
    slug,
    results,
    imagesForCarousel,
  } = props
  const classification =
    _classification === '*' ? 'Foot in the Door' : _classification
  const hits = results.hits ? results.hits.hits : results // searches and random querys return differently shaped JSON

  const perPage = 33 // how many items to show per page

  const [additionalPages, setAddlPages] = useState([])

  /** Show more button
   * keep additional results in state, load more when asked
   * and display each batch of `perPage` in its own `RoomGrid`
   *
   * TODO adjust routing to equal page number?
   * and enable ServerSide rendering for pages?
   * This would require not randomly shuffling thorugh artworks…
   *
   * Also, expand this functionality to /search?
   */
  async function loadMore() {
    const currentPage = additionalPages.length
    const from = currentPage * perPage

    const results = await getSearchResults(
      `classification:${slug === 'all' ? '*' : slug}`,
      {
        size: perPage,
        from,
        useNormalSearch: true,
      }
    )

    const moreArtworks = results.hits ? results.hits.hits : results // searches and random querys return differently shaped JSON

    setAddlPages(additionalPages.concat([moreArtworks]))
  }

  const lastPage = additionalPages[additionalPages.length - 1]
  let finishedPaginating = lastPage && lastPage.length < perPage

  useEffect(() => {
    setAddlPages([])
  }, [classification])

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  // if (router.isFallback) {
  //   return <div>Loading...</div>
  // }

  return (
    <Layout hideCTA={true}>
      <main className="md:my-16 flex flex-col">
        <h1 className="text-center text-5xl font-black capitalize md:-mb-20 md:mt-20">
          {classification}
        </h1>
        <LeftRightNav
          classifications={classifications}
          classification={classification}
          showAllAndStretch={true}
          imagesForCarousel={imagesForCarousel}
          className="order-first md:order-none"
        />
        <RoomGrid
          classification={classification}
          hits={hits}
          perPage={perPage}
          className="mt-24"
          label={`Browse all ${classification}`}
        />
        {additionalPages.map((page, index) => {
          return (
            <RoomGrid
              key={`page-${index}`}
              classification={classification}
              hits={page}
              perPage={perPage}
              className=""
            >
              Page {index + 2}
            </RoomGrid>
          )
        })}
        {finishedPaginating || (
          <button
            onClick={loadMore}
            onKeyPress={loadMore}
            className="block mt-6 p-4 mx-auto bg-gray-200 color-black w-64 hover:bg-gray-300"
          >
            Show More
          </button>
        )}
      </main>
      <aside>
        <LeftRightNav
          classifications={classifications}
          classification={classification}
          className="flex justify-between pt-48"
          imagesForCarousel={imagesForCarousel}
        >
          <SupportCTA />
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
  // TODO expand for multiple exhibitions
  const exhibitionId = '2760'
  const exhibitionSlug = 'foot-in-the-door'

  const manifest = {
    paths: classifications.concat('*').map((classification) => {
      let slug = classification.toLowerCase().replace(' ', '-')
      if (slug === '*') slug = 'all'

      return { params: { exhibitionId, exhibitionSlug, classification, slug } }
    }),
    fallback: false,
  }

  return manifest
}
