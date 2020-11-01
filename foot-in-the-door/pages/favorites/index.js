/** @format */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HiOutlineHeart } from '@meronex/icons/hi'

import Layout from '../../components/Layout'
import RoomGrid from '../../components/RoomGrid'
import { getUserLikes } from '../../util'

function FavoriteList() {
  const [data, setData] = useState({})
  const { artworkResults } = data

  useEffect(() => {
    async function getData() {
      const data = await getUserLikes()
      setData(data)
    }

    getData()
  }, [])

  const hits = (artworkResults?.hits ? artworkResults.hits.hits : []).filter(
    (art) => art
  )

  return (
    <Layout hideCTA={true}>
      <main>
        {hits ? (
          <section>
            <RoomGrid hits={hits.filter((art) => art)} hideLikeControl={true}>
              <h2 className="text-2xl font-black">Your Favorite Works</h2>
              <p>
                This list is saved in your browser, so it could be deleted if
                you change browsers or close this window. Come back and visit
                often to find new favorites!
              </p>
            </RoomGrid>
          </section>
        ) : (
          <p>loading…</p>
        )}
        {hits?.length === 0 && (
          <div>
            <p>
              Use the{' '}
              <HiOutlineHeart className="inline hover:bg-black hover:text-white" />{' '}
              button to save artworks you like and they will appear on this
              page.
            </p>
            <p>
              <Link href="/room/all">
                <a>Start by viewing all artworks &rarr;</a>
              </Link>
            </p>
            <p>
              If you aren&apos;t seeing your likes,{' '}
              <a href="https://support.mozilla.org/en-US/kb/websites-say-cookies-are-blocked-unblock-them">
                check that cookies aren&apos;t being blocked by your browser
              </a>
              .
            </p>
          </div>
        )}
      </main>
    </Layout>
  )
}

export default FavoriteList
