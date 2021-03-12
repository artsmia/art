/** @format */
import { promises as fs } from 'fs'
import Link from 'components/NestedLink'
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
  const { isClosed } = props.exhibitionData

  return (
    <Layout stickyCTA={true} stickyFooter={true} pageBlocked={isClosed}>
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
  const {
    exhibitionData,
    exhibitionData: {
      exhibition_title,
      display_date: exhDates,
      hideSearch,
      subPanels,
      // options from `data/exhibition/:id.md`
      segmentExhibitionTitle = true,
      markdownContent = null,
      showTableOfContents = false,
      showImageCarousel = false,
    },
  } = props

  const [title, subtitle] = segmentExhibitionTitle
    ? exhibition_title.split(': ')
    : [exhibition_title]

  return (
    <Layout hideCTA={true} hideSearch={hideSearch}>
      <main className="md:flex items-start mb-12">
        <div className="md:w-1/2 mr-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wide">
            {title}
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light">
            {subtitle}
          </h2>
          <Text>{exhibitionData?.description}</Text>
          <Text dangerous={true}>{`<strong>${exhDates}</strong><br />${markdownContent}`}</Text>

          {hideSearch || <SearchInput className="my-6" />}

          {subPanels?.length > 0 && showTableOfContents && (
            <>
              <h2 className="text-2xl font-black mt-8">Exhibition Sections</h2>
              <ul className="list-inside list-disc">
                {subPanels.map((subpanel) => {
                  const { Title: title } = subpanel
                  return (
                    <li key={subpanel.UniqueID}>
                      <Link
                        className="hover:underline"
                        href={`/room/${title
                          .toLowerCase()
                          .replace(/\s/g, '-')}`}
                      >
                        {subpanel.Title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
        {showImageCarousel && props.leadingImages && (
          <ImageCarousel
            data={props.leadingImages}
            className="sticky top-0"
            exhibitionData={exhibitionData}
          />
        )}
      </main>
      <div className="md:flex pb-6">
        <section></section>
      </div>
      <Head>
        <title>{title} | Mia </title>
        <meta name="twitter:card" content="summary_large_image"></meta>
        <meta property="og:title" content={`${title} | Mia`} />
        <meta property="og:description" content={`${title} | Mia`} />
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
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const exhId = Number(params.exhibitionId)
  const exhibitionData = await getMiaExhibitionData(exhId, fs)
  const isFitD = exhId === 2760
  let leadingImages

  const simpleExhibitionData = !isFitD && (!exhibitionData.subPanels?.length || 0) > 0
  if(simpleExhibitionData) {
    return {
      redirect: {
        destination: `/exhibitions/${exhId}/${params.exhibitionSlug}/room/all`,
        permanent: false,
      }
    }
  }

  // TODO de-dupe this by creating a FITD.md file and specifying leading images,
  // how to continue randomly assigning them per category?
  if (isFitD) {
    leadingImages = await getImages()
  } else if(exhibitionData.imageCarousel) {
    const { imageCarousel } = exhibitionData
    const imageIDs = imageCarousel?.leadingImages
    const imagesAPIRequest = await fetch(
      `https://search.artsmia.org/ids/${imageIDs.join(',')}`
    )
    const imagesAPI = await imagesAPIRequest.json()
    leadingImages = imagesAPI.hits.hits.map((art, index) => ({
      ...art._source,
      classification: exhibitionData?.subPanels[index]?.Title ?? 'todo classification',
      __artDirectionStyle:
        exhibitionData.imageCarousel.artDirection.indexOf(Number(art._id)) >= 0 ? 'object-left-top' : '',
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
