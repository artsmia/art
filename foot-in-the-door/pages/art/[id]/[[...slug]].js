/** @format */
import { promises as fs } from 'fs'
import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { HiMail } from '@meronex/icons/hi'
import { SiTwitter, SiFacebook } from '@meronex/icons/si'
import Hashids from 'hashids/cjs'
import makeSlug from 'slug'

import { JoinCTAPhrase, SupportCTA } from 'components/NavBar'
import Layout from 'components/Layout'
import LeftRightNav from 'components/LeftRightNav'
import RoomGrid from 'components/RoomGrid'
import {
  classifications as fitdClassifications,
  fetchById,
  getImageSrc,
  getSearchResults,
  getImages,
  getMiaExhibitionData,
} from 'util/index'
import Text from 'components/Text'
import NestedLink from 'components/NestedLink'
import ArtworkSideBySide from 'components/ArtworkSideBySide'

function Art(props) {
  const {
    artwork,
    classification,
    classificationResults,
    imagesForCarousel,
    isFitD,
    exhibitionData: { isClosed },
    exhibitionData,
  } = props

  const [isFirstVisit, setFirstVisit] = useState(false)
  useEffect(() => {
    const { visitCount } = JSON.parse(
      localStorage.getItem('artsmia-fitd') || '{}'
    )

    if (visitCount <= 1) setFirstVisit(true)
  }, [])

  const backToGroupLink = (artwork.__group?.link ?? classification)
    ?.replace(' (including Digital)', '')
    .toLowerCase()
    .replace(/\s+/g, '-')

  return (
    <Layout hideCTA={true} hideSearch={props.exhibitionData?.hideSearch}>
      <ArtworkSideBySide artwork={artwork} isFitD={isFitD} exhibitionData={exhibitionData}>
        <p className="flex items-center">
          <ShareLinks art={artwork} hideLinks={!isFitD} exhibitionData={props.exhibitionData} />
        </p>
        {!isFitD || isFirstVisit || (
          <p className="bg-gray-300 px-4 py-2 mt-4 font-light">
            <JoinCTAPhrase />
          </p>
        )}
      </ArtworkSideBySide>

      {isFirstVisit || isClosed ? (
        <ExhibitionContextBlurb
          isFitD={isFitD}
          exhibitionData={props.exhibitionData}
        />
      ) : (
        <div>
          <RoomGrid
            className="mt-6 pt-24 sm:pt-0"
            classification={classification}
            hits={classificationResults}
            focused={artwork}
            perPage={30}
            hideViewAll={true}
            label={`See more ${classification}`}
            hideLikeControl={!isFitD}
          />

          <NestedLink
            href={`/room/${backToGroupLink}`}
          >
            <a className="px-4 py-4 font-light float-right uppercase">
              Return to <strong>{classification}</strong> &rsaquo;
            </a>
          </NestedLink>

          {isFitD && (
            <aside className="mt-24">
              <LeftRightNav
                classifications={fitdClassifications}
                classification={artwork.classification}
                className="flex justify-between pt-48"
                imagesForCarousel={imagesForCarousel}
              >
                <SupportCTA />
              </LeftRightNav>
            </aside>
          )}
        </div>
      )}
    </Layout>
  )
}

export default Art

export async function getStaticProps({ params }) {
  const hashids = new Hashids(
    'foot in the door 2020', // salt
    3, // pad to this length
    'abcdefghijklmnopqrstuvwxyz' // alphabet: only lowercase letters
  )

  const { id, exhibitionId } = params
  const isFitD = Number(exhibitionId) === 2760
  const exhibitionData = await getMiaExhibitionData(exhibitionId, fs)

  const numericID = Number(id) ? Number(id) : hashids.decode(id)
  const hashid = hashids.encode(numericID)

  let artwork = await fetchById(numericID, isFitD)
  if (!isFitD && exhibitionData && exhibitionData.extra?.length > 0) {
    const exhibitionEntryRow = exhibitionData.extra.find(
      (d) => d.UniqueID === numericID
    )
    const text = exhibitionEntryRow?.Text
    const parentID = exhibitionEntryRow.ParentID
    const parentPanel = exhibitionData.extra.find(
      (d) => d.UniqueID === parentID
    )
    const siblingArtworkIds = exhibitionData.extra
      .filter((d) => d.ParentID === parentID)
      .map((d) => d.UniqueID)

    artwork.text = text
    artwork.__group = {
      title: parentPanel?.Title,
      siblingArtworkIds,
    }
  } else {
    if (!isFitD) {
      artwork.__group = {
        title: exhibitionData.exhibition_title,
        link: 'all',
        siblingArtworkIds: exhibitionData.objects,
      }
    }
  }

  // TODO swap this out for Todd Webb to search for the other artworks
  // within the same panel
  //
  // And what to do for Mia exhibitions without extra TMS content defined / `subpanels`?
  const classification = isFitD
    ? artwork.classification.toLowerCase().replace(/\s/g, '-')
    : artwork.__group
    ? artwork.__group.title
    : null
  const criteria = isFitD
    ? `classification:${classification}`
    : `artist:'Todd Webb'`
  const classificationResults = await getSearchResults(criteria, {
    isFitD,
    ids: isFitD ? null : artwork.__group?.siblingArtworkIds ?? null,
    size: 300,
  })

  const slug = makeSlug([artwork.title, artwork.artist].join(' '))
  // Because slug is a `[[...slug]]` route it's in an array. Is this necessary?
  // TODO this redirect makes page loading a lot slower… Disable for now.
  const enableCanonicalRedirect = false
  if (
    enableCanonicalRedirect &&
    (id === numericID || !params.slug || slug !== params.slug[0])
  )
    return {
      redirect: {
        destination: `/exhibitions/2760/foot-in-the-door/art/${hashid}/${slug}`,
        permanent: true,
      },
    }

  const imagesForCarousel = isFitD ? await getImages(4) : []

  return {
    props: {
      id: numericID,
      isFitD,
      artwork,
      classification,
      classificationResults,
      imagesForCarousel,
      exhibitionData,
    },
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

function ShareLinks(props) {
  const { art, hideLinks, exhibitionData } = props
  const mainArtist = art.artist.split(';')[0].replace('Artist: ', '')
  const title = `${art.title} by ${mainArtist}`

  const { exhibition_title: exhTitle, exhibition_id: exhId, slug: exhSlug } = exhibitionData

  // TODO change `id` to `:hashid/:slug`? Or get URL from useRouter?
  // get exhibition name from router (Layout does this)
  // customize away 'Foot in the Door'
  const shareMessage = `Visit this artwork in Mia’s ${exhTitle} Exhibition`
  const shareUrl = `https://collections.artsmia.org/exhibitions/${exhId}/${exhSlug}/art/${art.id}`

  const emailLink = `mailto:?subject=${shareMessage}&body=${shareUrl}`
  const twitterLink = `https://twitter.com/intent/tweet?url=${shareUrl}`
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
  const imageSrc = getImageSrc(art)

  return (
    <>
      <Head>
        <title>{title} | {exhTitle}</title>
        <meta
          name="Description"
          content={`Artwork: ${title} | ${exhTitle} at Mia`}
          key="description"
        />
        <meta name="twitter:card" content="summary_large_image"></meta>
        <meta property="og:title" content={title} />
        <meta property="og:description" content="" />
        <meta property="og:image" content={imageSrc} />
        <meta property="og:url" content={shareUrl} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@artsmia" />
      </Head>
      {hideLinks || (
        <>
          Share:
          <a href={emailLink}>
            <HiMail className="mx-1" size="1.5rem" />
          </a>{' '}
          <a href={twitterLink} _target="blank">
            <SiTwitter className="mx-1" size="1.5rem" />
          </a>{' '}
          <a href={facebookLink} _target="blank">
            <SiFacebook className="mx-1" size="1.5rem" />
          </a>
        </>
      )}
    </>
  )
}

// TODO - this uses localstorage to track if it's a users first visit to the
// SITE overall, and shows this context when it is.
// But should it track visits to each exhibition instead? i.e. if I visit Foot in the Door
// I should get the context blurb the first time and never again. But when I visit Labor
// Camp I should see Labor Camp's context, no?
function ExhibitionContextBlurb(props) {
  const { isFitD, exhibitionData } = props

  return isFitD ? (
    <FitDContextBlurb {...exhibitionData} />
  ) : (
    <>
      <aside className="bg-gray-300 p-4 px-4 mt-8 my-4 pb-0 mb-0">
        <Text>{exhibitionData.description.split('\n\n')[0]}</Text>
      </aside>
      <Link href={`/exhibitions/${exhibitionData.exhibition_id}/`}>
        <a className="block text-center uppercase hover:underline py-2 pb-4 hover:bg-gray-300">
          Enter <strong className="font-bold">{exhibitionData.exhibition_title}</strong>
        </a>
      </Link>
    </>
  )
}

function FitDContextBlurb({ isClosed }) {
  const message = isClosed
    ? `This artwork was featured in "Foot in the Door 5: The Virtual
            Exhibition," held from November 1, 2020, to January 10, 2021. The
            online exhibition showcased the works of over 2,000 Minnesota
            artists, with the unifying criteria that each piece measure less
            than one cubic foot.

            The concepts expressed in this exhibition were those of the
            artists, not of the museum. Please direct inquiries to
            visit@artsmia.org.`
    : `“Foot in the Door 5” celebrates the talent, diversity, and enthusiasm
          of our state’s visual artists. The exhibition occurs once every 10
          years, and by now, generations of artists have participated in it. The
          sole curatorial criteria? All submissions must measure at or under 12
          inches in height, width, and depth—literally inviting artists to place
          “a foot” in the museum’s galleries.`

  return (
    <>
      <aside className="bg-gray-300 p-4 px-4 mt-8 my-4">
        <Text>{message}</Text>
      </aside>
      {isClosed || (
        <Link href="/exhibitions/2760/foot-in-the-door">
          <a className="block text-center uppercase hover:no-underline">
            Enter <strong className="font-bold">Foot in the Door</strong>{' '}
            Exhibition
          </a>
        </Link>
      )}
    </>
  )
}
