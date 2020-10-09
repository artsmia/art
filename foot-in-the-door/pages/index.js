/** @format */
import Link from 'next/link'

import Layout from '../components/Layout'

function Home() {
  return (
    <Layout>
      <main className="md:flex">
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-black">
            Foot in the Door 5
          </h1>
          <h2 className="text-3xl md:text-3xl font-light -mt-4">
            The Virtual Exhibition
          </h2>
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
        <Link href="/room/ceramics">
          <div className="bg-gray-100 w-1/2 p-4 m-4">
            Image carousel goes here
          </div>
        </Link>
      </main>
    </Layout>
  )
}

export default Home
