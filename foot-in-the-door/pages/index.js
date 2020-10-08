/** @format */
import Head from 'next/head'
import Link from 'next/Link'

function Home() {
  return (
    <div className="px-16 py-5 text-gray-900">
      <Head>
        <title>Foot in the Door</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav className="flex items-start justify-between">
          <div>
            <Link href="/">
              <img
                src="https://styleguide.staging.artsmia.org/src/images/mia-wordmark.svg"
                className="h-6"
              />
            </Link>
            <a href="#">❮ Exit Exhibition</a>
          </div>

          <div className="uppercase tracking-wider font-semibold">
            <a
              href="https://ticket.artsmia.org/products/donate"
              className="p-2 mx-3"
            >
              Donate
            </a>
            <a
              href="https://ticket.artsmia.org/products/membership"
              className="p-2 px-4 mx-3 bg-gray-900 text-white"
            >
              Become a Member
            </a>
          </div>
        </nav>
      </header>

      <main className="flex mt-16">
        <div className="w-1/2">
          <h1 className="text-5xl font-black">Foot in the Door 5</h1>
          <h2 className="text-3xl font-light -mt-4">The Virtual Exhibition</h2>
          <p className="py-2">
            Held once every 10 years, “Foot in the Door” is an open exhibition
            for all Minnesota artists. Now marking its fourth decade, this
            exhibition celebrates the talent, diversity, and enthusiasm of
            Minnesota’s visual artists. This is an important event for the arts
            community and a great opportunity for artists to display their work
            at Mia. The sole curatorial criteria? Each submission must fit
            within one cubic foot.
          </p>
          <p className="py-2">
            New this year, the exhibition is going virtual! In order to
            prioritize safety, this exhibition will be completely digital to
            accommodate the huge number of participating artists and visitors.
          </p>

          <input
            type="search"
            placeholder="Search for artist, medium, keyword, color, etc"
            className="p-4 w-full"
          />
        </div>
        <div className="bg-gray-100 w-1/2 p-4 m-4">
          Image carousel goes here
        </div>
      </main>

      <footer className="border-t-2 flex justify-between mt-4">
        <div>
          Lead Sponsors:
          <br /> Thompson Reuters Target
        </div>
        <div>
          Major Sponsor:
          <br /> Delta
        </div>
        <div>MN State Arts Board Legacy lockup</div>
      </footer>
    </div>
  )
}

export default Home
