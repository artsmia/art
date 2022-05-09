/** @format */
import { useState, useEffect, useRef } from 'react'

import Layout from 'components/Layout'
// import Link from 'components/NestedLink'
import SearchInput from 'components/SearchInput'
import ArtworkSideBySide from 'components/ArtworkSideBySide'
import Head from 'next/head'

function Home(props) {
  const {
    wpData: { hero, main },
  } = props

  return (
    <Layout hideCTA={true} hideSearch={true}>
      <main className="flex flex-col md:flex-row -mt-6">
        <img
          src={hero.image.src}
          alt=""
          title={hero.image.caption}
          className="md:w-2/3"
        />
        <div className="md:ml-4 md:w-1/3 flex flex-col">
          <h2 className="font-black text-2xl">{hero.title}</h2>
          <div
            dangerouslySetInnerHTML={{ __html: hero.content }}
            className="text-xl"
          />

          <SearchInput
            customSearchUrl="http://collections.artsmia.org/search/[searchTerms]"
            className="mt-12"
          />
        </div>
      </main>
      <nav className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-8">
        {main.cells.map((cell) => {
          const { title, image, excerpt, menu } = cell

          return (
            <li key={title} className="list-none border-t-2 border-black">
              <a href={normalizeWpLink(cell.link)}>
                <h3 className="font-black text-xl">{title}</h3>
                <img src={image.src} alt="" />
                <span
                  dangerouslySetInnerHTML={{ __html: excerpt }}
                  className="inline-block mt-1"
                />
              </a>
              {menu && (
                <ul className="pt-2">
                  {menu.map((menuItem) => {
                    return (
                      <a
                        href={normalizeWpLink(menuItem.link)}
                        className="block font-bold uppercase hover:underline"
                        key={menuItem.text}
                      >
                        {menuItem.text}
                      </a>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </nav>
      <section
        style={{ minHeight: '90vh', display: 'none' }}
        className="min-height-screen mt-12"
      >
        <h2 className="text-xl font-black">Browse Random Artworks</h2>
        <RandomArtworkCarousel />
      </section>
      <Head>
        <title>Art + Artists | Mia</title>
      </Head>
    </Layout>
  )
}

export default Home

export async function getStaticProps() {
  const _fetch = await fetch(`https://new.artsmia.org/api/data/art-artists`)
  const wpData = await _fetch.json()

  return {
    props: {
      wpData,
    },
    revalidate: 6000,
  }
}

/** TODO
 *
 * handle loading better - once `refresh` is clicked, disable until next load
 * smooth out image loading. Add error state
 * fix controls to make it easy to browse through previous 'randoms'
 * add keyboard controls: arrows to go left and right, enter to refresh? (right should also refresh when at the end of the list)
 */
function RandomArtworkCarousel() {
  const [randomArtworks, newRandom] = useState([])
  const [index, setIndex] = useState(0)
  const randomRef = useRef(null)

  const fetchData = async () => {
    const response = await fetch(
      `https://search.artsmia.org/random/art?q=image:valid`
    )
    const newData = await response.json()
    newRandom([...randomArtworks, newData])
    setIndex(0)
    if (randomArtworks.length > 0) randomRef.current?.scrollIntoView(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const art = randomArtworks.slice(index - 1)[0]
  const allArtworksLink = `https://collections.artsmia.org/search/ids/${randomArtworks
    .map((art) => art.id)
    .join(',')}`

  return (
    <div ref={randomRef}>
      {art ? (
        <ArtworkSideBySide artwork={art}>
          <div className="flex flex-row justify-between mt-4">
            <button
              onClick={() => setIndex(index + 1)}
              disabled={randomArtworks.length > 0 && index > 0}
              className="p-2"
            >
              &larr;
            </button>
            <button onClick={fetchData} className="p-2">
              &#8635;
            </button>
            <button
              onClick={() => setIndex(index - 1)}
              disabled={index < 0}
              className="p-2"
            >
              &rarr;
            </button>
          </div>
          <div className="flex flex-row justify-between">
            <a href={`https://collections.artsmia.org/art/${art.id}`}>
              more info
            </a>
            {randomArtworks.length > 1 && (
              <a href={allArtworksLink}>show all {randomArtworks.length}</a>
            )}
          </div>
        </ArtworkSideBySide>
      ) : null}
    </div>
  )
}

function normalizeWpLink(link) {
  const isArtArtists = link.match(/\/art-artists\//)
  let normalizedLink
  if (link[0] === '/' && !isArtArtists) {
    normalizedLink = `https://new.artsmia.org${link}`
  } else if (isArtArtists) {
    normalizedLink = link.replace(/https?:\/\/new.artsmia.org/, '')
  } else {
    normalizedLink = link
  }

  return normalizedLink
}
