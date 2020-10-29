/** @format */
import Link from 'next/link'

import ImageCarousel from '../components/ImageCarousel'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchInput'

import { getImages } from './api/imagesForCarousel'

function Home(props) {
  return (
    <Layout stickyCTA={true} stickyFooter={true}>
      <main className="md:flex items-start mb-12">
        <div className="md:w-1/2 mr-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wide">
            Foot in the Door 5
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light">
            The Virtual Exhibition
          </h2>
          <p className="py-4 font-light">
            Since 1980, “Foot in the Door” has been an open exhibition for
            Minnesotan artists of all ages to present their work at the
            Minneapolis Institute of Art. The exhibition occurs once every 10
            years, and by now, generations of artists have participated in it.
            The sole curatorial criteria? All submissions must measure at or
            under 12 inches in height, width, and depth—literally inviting
            artists to place “a foot” in the museum’s galleries.
          </p>
          <p className="py-4 font-light">
            Serving as a snapshot of Minnesota’s creative scene, “Foot in the
            Door 5” celebrates the talent, diversity, and enthusiasm of our
            state’s visual artists. To prioritize safety for artists, visitors,
            and staff alike, this celebration of our community’s creativity is
            entirely virtual this year. Thanks to all artists who make this
            exhibition possible, especially amid the coronavirus pandemic and
            subsequent economic and personal impacts. You are proof that in
            times of adversity, creativity still triumphs.
          </p>
          <p className="py-4 font-light">
            Please note: Because this is an open-call exhibition, it might
            contain artworks some viewers consider inappropriate or
            objectionable. That’s democratic artistic expression in action.
          </p>

          <SearchInput className="my-6" />
        </div>
        <ImageCarousel
          data={props.classificationLeadingImages}
          className="sticky top-0"
        />
      </main>
      <aside className="md:flex pb-6">
        <div id="video" className="bg-pink-200 p-3 md:w-1/2 md:mx-2">
          VIDEO placeholder
        </div>
        <div id="related-events" className="md:w-1/2 md:mx-2 text-sm">
          <h3 className="font-black text-2xl">Exhibition Events</h3>
          <Link href="https://new.artsmia.org/event/virtual-family-day-foot-in-the-door">
            <a className="block bg-gray-300 my-4 p-2 px-4 font-light no-underline">
              <h3 className="font-black text-lg">
                Virtual Family Day: Foot in the Door
              </h3>
              <p>Sunday, November 8, 2020</p>
              <p>10:00 am</p>
            </a>
          </Link>
          <Link href="https://new.artsmia.org/event/virtual-open-mic-foot-in-the-door">
            <a className="block bg-gray-300 my-4 p-2 px-4 font-light no-underline">
              <h3 className="font-black text-lg">
                Virtual Open Mic: Foot in the Door
              </h3>
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
