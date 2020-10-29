/** @format */
import Link from 'next/link'

import ImageCarousel from '../components/ImageCarousel'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchInput'

import { getImages } from './api/imagesForCarousel'

const events = [
  {
    href: 'https://new.artsmia.org/event/virtual-family-day-foot-in-the-door',
    title: 'Virtual Family Day: Foot in the Door',
    date: 'Sunday, November 8, 2020',
    time: '10:00 am',
  },
  {
    href: 'https://new.artsmia.org/event/virtual-open-mic-foot-in-the-door',
    title: 'Virtual Open Mic: Foot in the Door',
    date: 'Sunday, November 21, 2020',
    time: '12:00pm to 1:30 pm',
  },
  {
    href: 'https://new.artsmia.org/event/virtual-open-studio-foot-in-the-door',
    title: 'Virtual Open Studio: Foot in the Door',
    date: 'Friday, December 18, 2020',
    time: '1:00 pm to 2:00 pm',
  },
]

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
        <div id="video" className="md:w-1/2 mr-12">
          <figure
            style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}
          >
            <iframe
              title="Foot in the Door 5 Artist: Ilene Krug Mojsilov"
              src="https://player.vimeo.com/video/471541996?color=ffffff&byline=0&dnt=1&title=0&portrait=0"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
            <figcaption className="hidden">
              Foot in the Door 5 Artist Video: Ilene Krug Mojsilov
            </figcaption>
          </figure>
        </div>
        <div id="related-events" className="md:w-1/2 md:mx-2 text-sm md:pl-1">
          <h3 className="font-black text-2xl">Exhibition Events</h3>
          {events.map((event) => (
            <EventBox key={event.title} {...event} />
          ))}
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

function EventBox(props) {
  const { href, title, date, time } = props
  return (
    <Link href={href}>
      <a className="block bg-gray-300 my-4 p-2 px-4 font-light no-underline hover:bg-black hover:text-white">
        <h3 className="font-black text-lg">{title}</h3>
        <p>{date}</p>
        <p>{time}</p>
      </a>
    </Link>
  )
}
