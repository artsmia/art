/** @format */
import { promises as fs } from 'fs'
import { useEffect, useState } from 'react'

import Layout from 'components/Layout'
import LeftRightNav from 'components/LeftRightNav'
import RoomGrid from 'components/RoomGrid'
import {
  classifications as fitdClassifications,
  getSearchResults,
  getImages,
  getMiaExhibitionData,
} from 'util/index'
import { SupportCTA } from 'components/NavBar'
import Text from 'components/Text'
import TitleSubtitle from 'components/TitleSubtitle'

const perPage = 33 // how many items to show per page.

function Room(props) {
  const {
    classification: _classification,
    slug,
    results,
    imagesForCarousel,
    exhibitionData: {
      isClosed,
      exhibition_title: exhTitle,
      segmentExhibitionTitle = true,
      bypassPublicAccess = true,
    },
  } = props
  const classification = _classification === '*' ? exhTitle : _classification
  let hits = results.hits ? results.hits.hits : results // searches and random querys return differently shaped JSON
  if(!bypassPublicAccess) {
    hits = hits.filter(hit => hit._source.public_access === "1")
  }

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
  let finishedPaginating =
    hits.length > perPage ||
    hits.length < perPage ||
    (lastPage && lastPage.length < perPage)

  useEffect(() => {
    setAddlPages([])
  }, [classification])

  const {
    exhibitionData: { subPanels, description: exhDescription, hideSearch, markdownContent },
    subpanel,
    isFitD,
  } = props
  const labelText = isFitD ? null : subpanel?.Text || exhDescription || markdownContent
  const classifications = isFitD
    ? fitdClassifications
    : subPanels.map((p) => p.Title)

  // For an "all" room with defined subpanels,
  // break each subpanel into it's own artwork grid
  const artworkGrid =
    slug === 'all' && subPanels?.length > 0 ? (
      subPanels.map((subpanel) => {
        const { Title: title, Text: subpanelText, artworkIds } = subpanel
        const subHits = hits.filter(
          (hit) => artworkIds.indexOf(Number(hit._id)) >= 0
        )
        return (
          <>
            <RoomGrid
              classification={title}
              hits={subHits}
              perPage={30}
              label={`Browse all ${subpanel.Title}`}
              text={subpanelText}
              className="mt-12"
              hideLikeControl={!isFitD}
              exhibitionData={props.exhibitionData}
            ></RoomGrid>
          </>
        )
      })
    ) : (
      <RoomGrid
        classification={classification}
        hits={hits}
        perPage={Math.max(hits.length, perPage)}
        className="mt-24"
        label={`Browse all ${classification}`}
        hideLikeControl={!isFitD}
        exhibitionData={props.exhibitionData}
      >
        <div className="max-w-3xl mx-auto"><Text dangerous={true}>{labelText}</Text></div>
      </RoomGrid>
    )

  return (
    <Layout hideCTA={true} pageBlocked={isClosed} hideSearch={hideSearch}>
      <main className="md:my-16 flex flex-col">
        <TitleSubtitle title={classification} useSegmentation={segmentExhibitionTitle} headerStyles="text-center" />
        <LeftRightNav
          classifications={classifications}
          classification={classification}
          showAllAndStretch={true}
          imagesForCarousel={imagesForCarousel}
          className="order-first md:order-none"
        />
        {artworkGrid}
        {additionalPages &&
          additionalPages.map((page, index) => {
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
        {classifications && <LeftRightNav
          classifications={classifications}
          classification={classification}
          className="flex justify-between pt-48"
          imagesForCarousel={imagesForCarousel}
        >
          {isFitD && <SupportCTA />}
        </LeftRightNav>}
      </aside>
    </Layout>
  )
}

export default Room

export async function getStaticProps({ params }) {
  const { exhibitionId, slug } = params
  const isFitD = Number(exhibitionId) === 2760
  let classification = slug.replace(/-/g, ' ')
  if (classification === 'all') classification = '*'
  const exhibitionData = await getMiaExhibitionData(exhibitionId, fs)
  const { dataPrefix } = exhibitionData
  const subpanel =
    exhibitionData.subPanels.find(
      (p) => p.Title.toLowerCase() === classification
    ) || null

  let results
  let imagesForCarousel
  if (isFitD) {
    imagesForCarousel = await getImages(4)
    results = await getSearchResults(`classification:${slug}`, {
      size: perPage,
    })
  } else if(dataPrefix) {
    imagesForCarousel = []
    results = await getSearchResults(null, {
      dataPrefix,
      size: 400,
    })
  } else {
    imagesForCarousel = await getImages(4, {
      groups: exhibitionData.subPanels.map((panel) => ({
        title: panel.Title,
        ids: panel.artworkIds,
      })),
    })
    const ids = subpanel
      ? subpanel.artworkIds
      : exhibitionData.extra?.length > 0
      ? exhibitionData.extra
          .filter((row) => row['ID Type'] === 'ObjectID')
          .map((row) => row.UniqueID)
      : exhibitionData.allowArtIds
      ? exhibitionData.allowArtIds.split(',')
      : exhibitionData.objects

    results = await getSearchResults(null, {
      ids,
      size: 1000, // when passing ids explicitly, don't limit size?
    })
  }

  return {
    props: {
      results,
      exhibitionData,
      subpanel,
      classification,
      slug,
      imagesForCarousel,
      isFitD,
    },
    revalidate: 600,
  }
}

export async function getStaticPaths() {
  const toddWebbData = await getMiaExhibitionData(2830, fs)
  const toddWebbRooms = toddWebbData.subPanels
    .map((group) => group.Title.replace(/ /g, '-').toLowerCase())
    .concat('*')

  const exhibitions = [
    {
      id: '2760',
      slug: 'foot-in-the-door',
      rooms: fitdClassifications.concat('*'),
    },
    {
      id: '2830',
      slug: 'todd-webb-in-africa',
      rooms: toddWebbRooms,
    },
  ]

  const manifest = {
    paths: exhibitions
      .map(({ id: exhibitionId, slug: exhibitionSlug, rooms }) => {
        return rooms.map((room) => {
          let slug = room.toLowerCase().replace(/\s/g, '-')
          if (slug === '*') slug = 'all'

          return { params: { exhibitionId, exhibitionSlug, room, slug } }
        })
      })
      .flat(),
    fallback: 'blocking',
  }

  return manifest
}
