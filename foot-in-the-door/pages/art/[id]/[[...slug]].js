/** @format */
import { Fragment } from 'react'
import Link from 'next/link'
import { HiHeart, HiMail } from '@meronex/icons/hi'
import { SiTwitter, SiFacebook } from '@meronex/icons/si'

import Layout from '../../../components/Layout'
import LeftRightNav from '../../../components/LeftRightNav'
import RoomGrid from '../../../components/RoomGrid'
import {
  classifications,
  cx,
  fetchById,
  getImageSrc,
  getSearchResults,
  likeArtwork,
} from '../../../util'

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
  } = props

  const keywords = (keywordsString.replace(/\s\s+/, ' ').indexOf(',') > -1
    ? keywordsString.split(/,\s?/g)
    : keywordsString.split(' ')
  ).filter((word) => !word.match(/^\s+$/))

  const aspectRatio = image_width / image_height
  const leftWidth = aspectRatio > 1 ? '1/2' : '2/3'
  const rightWidth = aspectRatio > 1 ? '1/2' : '1/3'

  return (
    <Layout>
      <main className="md:flex md:align-start max-h-screen">
        <img
          src={getImageSrc(artwork)}
          alt={description}
          className={cx(
            `md:w-${leftWidth}`,
            'px-4 object-contain object-center'
          )}
        />
        <div
          className={`flex flex-col justify-between border-t-2 border-black md:w-${rightWidth}`}
        >
          <div>
            <h1 className="text-2xl font-black capitalize">{title}</h1>
            <h2 className="text-xl font-bold">
              {artist}, <span className="text-base font-normal">{dated}</span>
            </h2>
            <p>{medium}</p>
            <p>{dimension}</p>
            <p>( color )</p>
            <p className="py-4 hidden">{description}</p>
            {keywordsString && (
              <p className="whitespace-normal break-word">
                Keywords:{' '}
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

          <div className="border-t-2 mt-4 self-end">
            <p className="flex items-center">
              {/* TODO use a checkbox instead? */}
              <span
                className="pr-1"
                onClick={() => likeArtwork(artwork.id)}
                onKeyPress={() => likeArtwork(artwork.id)}
                role="button"
                tabIndex={0}
              >
                <HiHeart />
              </span>
              Share: <HiMail className="mx-1" /> <SiTwitter className="mx-1" />{' '}
              <SiFacebook className="mx-1" />
            </p>
            <p className="bg-gray-300 px-4 py-2 mt-4">
              <a href="https://ticket.artsmia.org/catalog/support-mia">
                Keep Mia open, free, and accessible to all virtually and
                in-person by becoming a member or donating today. We are always
                grateful to our members.
              </a>
            </p>
          </div>
        </div>
      </main>

      <RoomGrid
        className="mt-6"
        classification={classification}
        hits={classificationResults}
        focused={artwork}
        perPage={30}
      />

      <aside>
        <LeftRightNav
          classifications={classifications}
          classification={artwork.classification}
          className="flex justify-between mt-16"
        ></LeftRightNav>
      </aside>
    </Layout>
  )
}

export default Art

// TODO convert to getStaticProps + getStaticPaths
export async function getServerSideProps({ params }) {
  const { id } = params
  // TODO redirect `/[id]` to canonical `/[id]/[slug]`

  const artwork = await fetchById(id)
  const classification = artwork.classification.toLowerCase().replace(' ', '-')
  const classificationResults = await getSearchResults(
    `classification:${classification}`
  )

  return {
    props: {
      id,
      artwork,
      classificationResults,
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
