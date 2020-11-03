/** @format */
import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { HiMail } from '@meronex/icons/hi'
import { SiTwitter, SiFacebook } from '@meronex/icons/si'
import Hashids from 'hashids/cjs'
import makeSlug from 'slug'

import { JoinCTAPhrase, SupportCTA } from '../../../components/NavBar'
import Layout from '../../../components/Layout'
import LeftRightNav from '../../../components/LeftRightNav'
import RoomGrid from '../../../components/RoomGrid'
import {
  classifications,
  cx,
  fetchById,
  getImageSrc,
  getImageProps,
  getSearchResults,
  getImages,
} from '../../../util'
import LikeControl from '../../../components/LikeControl'
import ImageWithBackground from '../../../components/ImageWithBackground'

function Art(props) {
  const {
    artwork,
    artwork: {
      title,
      artist,
      medium,
      dated,
      description,
      keywords: keywordsString,
      dimension,
      classification,
      image_width,
      image_height,
    },
    classificationResults,
    imagesForCarousel,
  } = props

  const [isFirstVisit, setFirstVisit] = useState(false)
  useEffect(() => {
    const { visitCount } = JSON.parse(
      localStorage.getItem('artsmia-fitd') || '{}'
    )

    if (visitCount <= 1) setFirstVisit(true)
  }, [])

  const keywords = (keywordsString.replace(/\s\s+/, ' ').indexOf(',') > -1
    ? keywordsString.split(/,\s?/g)
    : keywordsString.split(' ')
  ).filter((word) => !word.match(/^\s+$/))

  const aspectRatio = image_width / image_height
  const isPortrait = aspectRatio <= 1
  const leftWidth = isPortrait ? '1/2' : '2/3'
  const rightWidth = isPortrait ? '1/2' : '1/3'
  const imgMaxHeight = isPortrait ? '90vh' : 'auto'
  const imgMaxWidth = isPortrait ? `${90 * aspectRatio}vh` : '100%'
  const imageProps = getImageProps(artwork)
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
          <img {...imageProps} alt={description} key={artwork.id} />
          <LikeControl artwork={artwork} showConfirmation={true} />
        </ImageWithBackground>
        <div
          className={`flex flex-col justify-start border-t-2 border-black md:w-${rightWidth} md:ml-2 `}
        >
          <div className="font-light">
            <h1 className="text-2xl font-black capitalize">{title}</h1>
            <h2 className="text-lg font-bold">
              {artist}, <span className="text-base font-light">{dated}</span>
            </h2>
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
          </div>

          <div className="border-t-2 border-opacity-75 mt-8 lg:mt-16">
            <p className="flex items-center">
              <ShareLinks art={artwork} />
            </p>
            {isFirstVisit || (
              <p className="bg-gray-300 px-4 py-2 mt-4 font-light">
                <JoinCTAPhrase />
              </p>
            )}
          </div>
        </div>
      </main>

      {isFirstVisit ? (
        <FitDContextBlurb />
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

          <Link
            href={`/room/${artwork.classification
              .replace(' (including Digital)', '')
              .toLowerCase()
              .replace(' ', '-')}`}
          >
            <a className="px-4 py-4 font-light float-right uppercase">
              {artwork.classification} &rsaquo;
            </a>
          </Link>

          <aside className="mt-24">
            <LeftRightNav
              classifications={classifications}
              classification={artwork.classification}
              className="flex justify-between pt-48"
              imagesForCarousel={imagesForCarousel}
            >
              <SupportCTA />
            </LeftRightNav>
          </aside>
        </div>
      )}
    </Layout>
  )
}

export default Art

// TODO convert to getStaticProps + getStaticPaths
export async function getServerSideProps({ params }) {
  const hashids = new Hashids(
    'foot in the door 2020', // salt
    3, // pad to this length
    'abcdefghijklmnopqrstuvwxyz' // alphabet: only lowercase letters
  )

  const { id } = params
  const numericID = Number(id) ? Number(id) : hashids.decode(id)
  const hashid = hashids.encode(numericID)

  const artwork = await fetchById(numericID)
  // console.info({ id, numericID, hashid, artwork })
  const classification = artwork.classification.toLowerCase().replace(' ', '-')
  const classificationResults = await getSearchResults(
    `classification:${classification}`
  )

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

  const imagesForCarousel = await getImages(4)

  return {
    props: {
      id: numericID,
      artwork,
      classificationResults,
      imagesForCarousel,
    },
  }
}

export async function _getStaticPaths() {
  return {
    paths: [1, 2, 3].map((id) => {
      const slug = ''

      return { params: { artwork: [id, slug] } }
    }),
    fallback: true,
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

function FitDContextBlurb() {
  return (
    <>
      <aside className="bg-gray-300 p-4 px-4 mt-8 my-4">
        <p>
          “Foot in the Door 5” celebrates the talent, diversity, and enthusiasm
          of our state’s visual artists. The exhibition occurs once every 10
          years, and by now, generations of artists have participated in it. The
          sole curatorial criteria? All submissions must measure at or under 12
          inches in height, width, and depth—literally inviting artists to place
          “a foot” in the museum’s galleries.
        </p>
      </aside>
      <Link href="/">
        <a className="block text-center uppercase hover:no-underline">
          Enter <strong className="font-bold">Foot in the Door</strong>{' '}
          Exhibition
        </a>
      </Link>
    </>
  )
}
