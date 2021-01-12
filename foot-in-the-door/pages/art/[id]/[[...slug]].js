/** @format */
import fs from 'fs'
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
  cx,
  fetchById,
  getImageSrc,
  getImageProps,
  getSearchResults,
  getImages,
  getMiaExhibitionData,
} from 'util/index'
import LikeControl from 'components/LikeControl'
import ImageWithBackground from 'components/ImageWithBackground'
import Text from 'components/Text'
import NestedLink from 'components/NestedLink'

function Art(props) {
  const {
    artwork,
    artwork: {
      title,
      artist: rawArtist,
      medium,
      dated,
      description,
      keywords: keywordsString,
      dimension,
      image_width,
      image_height,
    },
    classification,
    classificationResults,
    imagesForCarousel,
    isFitD,
    exhibitionData: { isClosed },
  } = props

  const artist = rawArtist.replace('Artist: ', '')

  const [isFirstVisit, setFirstVisit] = useState(false)
  useEffect(() => {
    const { visitCount } = JSON.parse(
      localStorage.getItem('artsmia-fitd') || '{}'
    )

    if (visitCount <= 1) setFirstVisit(true)
  }, [])

  const keywords =
    keywordsString &&
    (keywordsString?.replace(/\s\s+/, ' ').indexOf(',') > -1
      ? keywordsString.split(/,\s?/g)
      : keywordsString.split(' ')
    ).filter((word) => !word.match(/^\s+$/))

  const aspectRatio = image_width / image_height
  const isPortrait = true || aspectRatio <= 1
  const leftWidth = isPortrait ? '1/2' : '2/3'
  const rightWidth = isPortrait ? '1/2' : '1/3'
  const imgMaxHeight = isPortrait ? '90vh' : 'auto'
  const imgMaxWidth = isPortrait ? `${90 * aspectRatio}vh` : '100%'
  const imageProps = getImageProps(artwork, { fullSize: true })
  const { src: imageSrc } = imageProps

  return (
    <Layout hideCTA={true}>
      <main className="md:flex md:align-start off:min-h-screen-3/5 pt-2">
        <ImageWithBackground
          imageSrc={imageSrc}
          className={cx(
            `relative md:w-${leftWidth}`,
            'object-contain object-center max-h-full md:mr-4'
          )}
        >
          <img
            {...imageProps}
            alt={description}
            key={artwork.id}
            className="sticky top-2"
            style={{ top: '0.5rem' }}
          />
          <LikeControl artwork={artwork} showConfirmation={true} />
        </ImageWithBackground>
        <div
          className={`flex flex-col justify-start border-t-2 border-black md:w-${rightWidth} md:ml-2 `}
        >
          <div className="font-light">
            <h1 className="text-2xl font-black capitalize">
              {title}, <span className="text-base font-light">{dated}</span>
            </h1>
            <h2 className="text-lg font-bold">{artist}</h2>
            <p>{medium}</p>
            <p>{dimension}</p>
            <p className="bg-pink-300 hidden">COLOR SEARCH</p>
            <p className="py-4 hidden">{description}</p>
            {keywordsString && (
              <p className="whitespace-normal break-word overflow-scroll">
                <strong>Keywords</strong>:{' '}
                {keywords.map((word, index) => (
                  <Fragment key={word}>
                    <Link href={`/search/keywords:${word}`} key={word}>
                      <a className="pl-1">{word}</a>
                    </Link>
                    {index === keywords.length - 1 ? '' : ','}{' '}
                  </Fragment>
                ))}
              </p>
            )}
            <Text>{artwork?.text}</Text>
          </div>

          <div className="border-t-2 border-opacity-75 mt-8 lg:mt-16">
            {isFitD || (
              <>
                <p>
                  Image: {artwork.rights_type}. {artwork.creditline}
                </p>
              </>
            )}
            {isFitD && (
              <p className="flex items-center">
                <ShareLinks art={artwork} />
              </p>
            )}
            {!isFitD || isFirstVisit || (
              <p className="bg-gray-300 px-4 py-2 mt-4 font-light">
                <JoinCTAPhrase />
              </p>
            )}
          </div>
        </div>
      </main>

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
          />

          <NestedLink
            href={`/room/${classification
              ?.replace(' (including Digital)', '')
              .toLowerCase()
              .replace(/\s+/g, '-')}`}
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
  if (!isFitD && exhibitionData && exhibitionData.extra) {
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
  }

  // TODO swap this out for Todd Webb to search for the other artworks
  // within the same panel
  const classification = isFitD
    ? artwork.classification.toLowerCase().replace(/\s/g, '-')
    : artwork.__group.title
  const criteria = isFitD
    ? `classification:${classification}`
    : `artist:'Todd Webb'`
  const classificationResults = await getSearchResults(criteria, {
    isFitD,
    ids: isFitD ? null : artwork.__group.siblingArtworkIds,
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
  const { art } = props
  const title = `${art.title} by ${art.artist}`
  const shareMessage = `Visit this artwork in Mia’s Foot in the Door Exhibition`
  // const shareUrl = `https://fitd-kjell.lume1.vercel.app/exhibitions/2760/foot-in-the-door/art/${art.id}`
  // const shareUrl = `https://fitd.vercel.app/exhibitions/2760/foot-in-the-door/art/${art.id}`
  // TODO change `id` to `:hashid/:slug`? Or get URL from useRouter?
  const shareUrl = `https://collections.artsmia.org/exhibitions/2760/foot-in-the-door/art/${art.id}`
  const emailLink = `mailto:?subject=${shareMessage}&body=${shareUrl}`
  const twitterLink = `https://twitter.com/intent/tweet?url=${shareUrl}`
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
  const imageSrc = getImageSrc(art)

  return (
    <>
      <Head>
        <title>{title} | Foot in the Door</title>
        <meta
          name="Description"
          content={`Artwork: ${title} | Foot in the Door at Mia`}
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
  )
}

function ExhibitionContextBlurb(props) {
  const { isFitD, exhibitionData } = props

  return isFitD ? (
    <FitDContextBlurb {...exhibitionData} />
  ) : (
    <>
      <aside className="bg-gray-300 p-4 px-4 mt-8 my-4">
        <p>{exhibitionData.description.split('\n\n')[0]}</p>
      </aside>
      <Link href="/exhibitions/2830/todd-webb-in-africa">
        <a className="block text-center uppercase hover:no-underline">
          Enter <strong className="font-bold">Todd Webb In Africa</strong>{' '}
          Exhibition
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
