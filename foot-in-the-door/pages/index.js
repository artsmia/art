/** @format */
import { useState, useEffect, useRef } from 'react'

import Layout from 'components/Layout'
import Link from 'components/NestedLink'
import SearchInput from 'components/SearchInput'
import ArtworkSideBySide from 'components/ArtworkSideBySide'
import { segmentTitle, cx } from 'util/index'

/** TODO
 *
 * show link lists horizontally with thumbnail image
 * add interactive museum map
 */
function Home() {
  return (
    <Layout hideCTA={true} hideSearch={true}>
      <main className="prose max-w-none">
        <h1>Discover the Collection</h1>
        <p>
          Search for artwork using a keyword, artist&apos;s name, style of art,
          or accession number. Unsure what to search for? Get started with the
          categories below, or browse more than 80,000 artworks on Mia&apos;s
          Collection site.
        </p>
        <SearchInput customSearchUrl="http://collections.artsmia.org/search/[searchTerms]" />
      </main>
      <section className="mt-4">
        <LinkRoll
          title="Online Exhibitions"
          items={[
            [
              'Todd Webb in Africa: Outside the Frame',
              '/exhibitions/2830/todd-webb-in-africa',
              'https://images.artsmia.org/wp-content/uploads/2020/12/21071646/TW_WEBIMAGE_L2020.85.81_cropped-525x350.jpg',
            ],
            [
              'In The Presence of Our Ancestors',
              'https://new.artsmia.org/exhibition/in-the-presence-of-our-ancestors-southern-perspectives-in-african-american-art',
              'https://images.artsmia.org/wp-content/uploads/2020/03/07103130/190306_mia334_5395-1-resized1.jpg',
            ],
            [
              'Freedom Rising: I Am the Story / L’Merchie Frazier',
              'https://new.artsmia.org/exhibition/freedom-rising-i-am-the-story-lmerchie-frazier',
              'https://images.artsmia.org/wp-content/uploads/2020/10/20083524/ext_202010190009-525x350.jpg',
            ],
          ]}
        />
        <LinkRoll
          title="Special Collections"
          items={[
            [
              'African American Art and Artists',
              'https://new.artsmia.org/black-history-month/',
              'https://images.artsmia.org/wp-content/uploads/2021/01/08091830/2018.30.6-525x350.jpg',
            ],
            [
              'Open Access',
              'https://collections.artsmia.org/info/open-access',
              'https://iiif.dx.artsmia.org/43359.jpg/1081,486,2306,1537/800,/0/default.jpg',
            ],
            [
              'Women Artists',
              'https://new.artsmia.org/womens-history-month/',
              'https://images.artsmia.org/wp-content/uploads/2020/08/03045052/HartiganCrop1.51-525x350.jpg',
            ],
          ]}
        />
      </section>
      <section
        style={{ minHeight: '90vh' }}
        className="min-height-screen mt-12"
      >
        <h2 className="text-xl font-black">Browse Random Artworks</h2>
        <RandomArtworkCarousel />
      </section>
      <HomeNav className="mt-8" />
    </Layout>
  )
}

export default Home

function HomeNav(props) {
  const { className } = props
  const itemClasses = 'flex-1 text-center font-bold text-lg'

  return (
    <nav className={cx('flex mb-4 border-t-2 border-black px-4', className)}>
      <a
        href="https://new.artsmia.org/art-artists/explore"
        className={itemClasses}
      >
        Explore
      </a>
      <a
        href="https://new.artsmia.org/art-artists/curatorial-departments"
        className={itemClasses}
      >
        Departments
      </a>
      <a href="https://collections.artsmia.org/new" className={itemClasses}>
        New to Mia
      </a>
    </nav>
  )
}

function LinkRoll(props) {
  const { title, items } = props

  return (
    <section className="border-t-2 border-black mb-6">
      <h2 className="text-xl font-light mb-4">{segmentTitle(title)}</h2>
      <ul className="list-none flex flex-row flex-wrap">
        {items.map(([name, link, image]) => (
          <li key={name} className="pr-4 mb-2 sm:w-1/2 md:w-1/3 group">
            <Link href={link}>
              <a className="group-hover:bg-black group-hover:text-white">
                <img src={image} alt="" />
                <strong className="font-light text-lg no-underline group-hover:underline">
                  {segmentTitle(name)}
                </strong>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
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
