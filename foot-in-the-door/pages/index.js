/** @format */
import Link from 'next/link'

import ImageCarousel from '../components/ImageCarousel'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchInput'

import { getImages } from './api/imagesForCarousel'

function Home(props) {
  return (
    <Layout stickyCTA={true}>
      <main className="md:flex items-center">
        <div className="md:w-1/2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
            Foot in the Door 5
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-3xl font-light -mt-4">
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

          <SearchInput className="my-6" />
        </div>
        <ImageCarousel data={props.classificationLeadingImages} />
      </main>
      <aside className="md:flex pb-6">
        <div id="video" className="bg-pink-200 p-3 md:w-1/2 md:mx-2">
          VIDEO placeholder
        </div>
        <div id="related-events" className="md:w-1/2 md:mx-2">
          <h3 className="font-black text-2xl">Exhibition Events</h3>
          <Link href="https://new.artsmia.org/event/virtual-family-day-foot-in-the-door">
            <a className="block bg-gray-300 my-4 p-2 px-4 text-lg">
              <h3 className="font-black">
                Virtual Family Day: Foot in the Door
              </h3>
              <p>Sunday, November 8, 2020</p>
              <p>10:00 am</p>
            </a>
          </Link>
          <Link href="https://new.artsmia.org/event/virtual-open-mic-foot-in-the-door">
            <a className="block bg-gray-300 my-4 p-2 px-4 text-lg">
              <h3 className="font-black">Virtual Open Mic: Foot in the Door</h3>
              <p>Saturday, November 21, 2020</p>
              <p>12:00 pm to 1:30 pm</p>
            </a>
          </Link>
        </div>
      </aside>
    </Layout>
  )
}

export default Home

export async function getStaticProps() {
  const classificationLeadingImages = await getImages()

  return {
    props: {
      classificationLeadingImages,
    },
  }
}
