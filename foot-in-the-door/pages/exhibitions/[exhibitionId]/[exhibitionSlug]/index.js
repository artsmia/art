/** @format */
import fs from 'fs'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ImageCarousel from 'components/ImageCarousel'
import Layout from 'components/Layout'
import SearchInput from 'components/SearchInput'
import Text from 'components/Text'

import { getImages, getMiaExhibitionData } from 'util/index'

import { videos } from './video'

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
    date: 'Friday, January 8, 2021',
    time: '1:00 pm to 2:00 pm',
  },
]

function ExhibitionHome(props) {
  const router = useRouter()
  const { exhibitionId: id } = router.query

  return id === '2760' ? <FitdHome {...props} /> : <MiaExhibition {...props} />
}

function FitdHome(props) {
  const video = videos[1]
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
        <ImageCarousel data={props.leadingImages} className="sticky top-0" />
      </main>
      <aside className="md:flex pb-6">
        <div id="video" className="md:w-1/2 pb-8 md: pb-0 md:mr-12">
          <h3 className="font-black text-2xl">Artist Videos</h3>
          <p>Meet participating artists. New videos released each week.</p>
          <figure className="group mt-1">
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
              }}
            >
              <iframe
                title={video.caption}
                src={`https://player.vimeo.com/video/${video.vimeoId}?color=ffffff&byline=0&title=0&portrait=0&texttrack=en`}
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
            <figcaption className="text-sm invisible group-hover:visible bg-gray-200 p-1 px-2">
              <a
                href={`https://vimeo.com/${video.vimeoId}`}
                className="no-underline hover:underline"
              >
                {video.caption}
              </a>
            </figcaption>
          </figure>
          <Link href="/exhibitions/2760/foot-in-the-door/video">
            <a className="uppercase border mr-8 px-2 p-1 font-bold no-underline hover:underline text-sm">
              View All Featured Artists
            </a>
          </Link>
        </div>
        <div id="related-events" className="md:w-1/2 md:mx-2 text-sm md:pl-1">
          <h3 className="font-black text-2xl">Exhibition Events</h3>
          {events.map((event) => (
            <EventBox key={event.title} {...event} />
          ))}
        </div>
      </aside>
      <Head>
        <title>Foot in the Door 5 | Mia </title>
        <meta name="twitter:card" content="summary_large_image"></meta>
        <meta property="og:title" content="Foot in the Door 5 | Mia" />
        <meta
          property="og:description"
          content="Foot in the Door 5: The Virtual Exhibition – Minneapolis Institute of Art #FootInTheDoor @artsmia"
        />
        <meta
          property="og:image"
          content="https://images.artsmia.org/wp-content/uploads/2020/10/31090903/tn_FitD5_web_1200x667-1200x667.jpg"
        />
        <meta
          property="og:url"
          content="https://collections.artmsia.org/exhibitions/2760/foot-in-the-door/"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@artsmia" />
      </Head>
    </Layout>
  )
}

function MiaExhibition(props) {
  const { exhibitionData } = props
  const showSearchAndCarousel = false

  return (
    <Layout hideCTA={true}>
      <main className="md:flex items-start mb-12">
        <div className="md:w-1/2 mr-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wide">
            Todd Webb In Africa
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light">
            Outside the Frame
          </h2>
          <Text>{exhibitionData?.description}</Text>

          {showSearchAndCarousel && <SearchInput className="my-6" />}
        </div>
        {props.leadingImages && (
          <ImageCarousel
            data={props.leadingImages}
            className="sticky top-0"
            exhibitionData={exhibitionData}
          />
        )}
      </main>
      <aside className="md:flex pb-6">
        <p>additional content?</p>
        <p>ex: exhibition dates, table of contents?</p>
      </aside>
      <Head>
        <title>Todd Webb in Africa | Mia </title>
        <meta name="twitter:card" content="summary_large_image"></meta>
        <meta property="og:title" content="Todd Webb In Africa | Mia" />
        <meta property="og:description" content="Todd Webb in Africa" />
        <meta property="og:image" content="TODO CHANGE" />
        <meta property="og:url" content="TODO change" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@artsmia" />
      </Head>
    </Layout>
  )
}

export default ExhibitionHome

export async function getStaticPaths() {
  return {
    paths: [
      '/exhibitions/2760/foot-in-the-door',
      '/exhibitions/2830/todd-webb-in-africa',
    ],
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const exhibitionData = await getMiaExhibitionData(params.exhibitionId, fs)
  const isFitD = Number(params.exhibitionId) === 2760
  let leadingImages

  // TODO de-dupe this
  if (isFitD) {
    leadingImages = await getImages()
  } else {
    const imageIDs = exhibitionData.subPanels.map((p) => p.artworkIds[0])
    const imagesAPIRequest = await fetch(
      `https://search.artsmia.org/ids/${imageIDs.join(',')}`
    )
    const imagesAPI = await imagesAPIRequest.json()
    leadingImages = imagesAPI.hits.hits.map((art, index) => ({
      ...art._source,
      classification: exhibitionData.subPanels[index].Title,
    }))
  }

  return {
    props: {
      leadingImages,
      exhibitionData,
    },
  }
}

function EventBox(props) {
  const { href, title, date, time } = props
  const eventPassed = date.match(/2020/)

  const classes = [
    'block bg-gray-300 my-4 p-2 px-4 font-light no-underline hover:bg-black hover:text-white',
    eventPassed ? 'opacity-50' : '',
  ].join(' ')

  return (
    <Link href={href}>
      <a className={classes}>
        <h3 className="font-black text-lg">{title}</h3>
        <p>{date}</p>
        <p>{time}</p>
      </a>
    </Link>
  )
}
