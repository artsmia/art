/** @format */
import { useState, useEffect } from 'react'

import Layout from 'components/Layout'
import Link from 'components/NestedLink'
import SearchInput from 'components/SearchInput'
import ArtworkSideBySide from 'components/ArtworkSideBySide'
import { cx } from 'util/index'

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
          title="Ongoing Exhibitions"
          items={[
            [
              'Foot in the Door 5: The Virtual Exhibition',
              '/exhibitions/2760/foot-in-the-door',
              'https://images.artsmia.org/wp-content/uploads/2020/10/31090903/tn_FitD5_web_1200x667-1200x667-525x350.jpg',
            ],
            [
              'Todd Webb in Africa: Outside the Frame',
              '/exhibitions/2830/todd-webb-in-africa',
              'https://images.artsmia.org/wp-content/uploads/2020/12/21071646/TW_WEBIMAGE_L2020.85.81_cropped-525x350.jpg',
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
      <section style={{ minHeight: '90vh' }} className="min-height-screen">
        <h2 className="text-2xl font-black">Browse Random Artworks</h2>
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
    <section className="">
      <h2 className="text-xl font-black">{title}</h2>
      <ul className="list-none flex flex-row">
        {items.map(([name, link, image]) => (
          <li key={name} className="p-2">
            <img src={image} alt="" />
            <Link href={link}>
              <a>{name}</a>
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

  const fetchData = async () => {
    const response = await fetch(
      `https://search.artsmia.org/random/art?q=image:valid`
    )
    const newData = await response.json()
    newRandom([...randomArtworks, newData])
    setIndex(0)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const art = randomArtworks.slice(index - 1)[0]
  const allArtworksLink = `https://collections.artsmia.org/search/ids/${randomArtworks
    .map((art) => art.id)
    .join(',')}`

  return art ? (
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
        <a href={`https://collections.artsmia.org/art/${art.id}`}>more info</a>
        {randomArtworks.length > 1 && (
          <a href={allArtworksLink}>show all {randomArtworks.length}</a>
        )}
      </div>
    </ArtworkSideBySide>
  ) : null
}
