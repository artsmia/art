/** @format */

import { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'

export const videos = [
  {
    vimeoId: 480895859,
    caption: 'Foot in the Door 5 Artist: Eyenga Bokamba',
  },
  {
    vimeoId: 480525373,
    caption: 'Foot in the Door 5 Artist: Sammy Austin',
  },
  {
    vimeoId: 471541996,
    caption: 'Foot in the Door 5 Artist Video: Ilene Krug Mojsilov',
  },
  {
    vimeoId: 478029945,
    caption: 'Foot in the Door 5 Artist: Davinia',
  },
  {
    vimeoId: 475231372,
    caption: 'Foot in the Door 5 Artist: Alonzo Pantoja',
  },
  {
    vimeoId: 480470984,
    caption: 'Foot in the Door 5 Artist: Tamara Aupaumut',
  },
  {
    vimeoId: 478130564,
    caption: 'Foot in the Door 5 Artist: TimmiLynn Johnson',
  },
  {
    vimeoId: 479910635,
    caption: 'Foot in the Door 5 Artist: Ken Wenzel',
  },
  {
    vimeoId: 478085063,
    caption: 'Foot in the Door 5 Artist: Paula Warn',
  },
  {
    vimeoId: 486926215,
    caption: 'Foot in the Door 5 Artist: Steve Lang',
  },
  {
    vimeoId: 486145748,
    caption: 'Foot in the Door 5 Artist: Kate Brenner-Adam',
  },
  {
    vimeoId: 485722162,
    caption: 'Foot in the Door 5 Artist: Nancy Ariza',
  },
  {
    vimeoId: 486174255,
    caption: 'Foot in the Door 5 Artist: Rurik Hover',
  },
]

function Video() {
  const [showAllVideos, setShowAllVideos] = useState(false)

  return (
    <Layout>
      <main className="md:flex items-start mb-12">
        <div className="md:w-1/2 mr-12 flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wide inline-block">
            Foot in the Door 5:
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light inline ml-2">
            Featured Artist Videos
          </h2>
          <p className="text-2xl font-light">
            What makes Foot in the Door 5: The Virtual Exhibition so unique?
          </p>
          <p className="text-2xl font-light">
            The thousands of participating Minnesota artists! Get to know a few
            of them in these 1-minute videos. Each artist touches on their
            creative process and specific artwork featured in the exhibition.
            Meet participating artists. New videos released each week.
          </p>
        </div>
        <div className="flex flex-col">
          {videos.slice(0, 2).map((video) => (
            <VideoBox key={video.vimeoId} {...video} />
          ))}
        </div>
      </main>
      <details>
        <summary
          className="uppercase border mr-8 px-2 p-1 font-bold no-underline hover:underline text-sm"
          onClick={() => setShowAllVideos(!showAllVideos)}
        >
          {showAllVideos ? 'Hide Videos' : `Show all ${videos.length} Videos`}
        </summary>
        {showAllVideos && (
          <div id="video" className="md:w-1/2 pb-8 md: pb-0 md:mr-12">
            {videos.slice(2, videos.length).map((video) => (
              <VideoBox key={video.vimeoId} {...video} />
            ))}
          </div>
        )}
      </details>
      <Head>
        <title>Foot in the Door 5: Featured Artist Videos | Mia</title>
        <meta property="og:title" content="Foot in the Door 5: Featured Artist Videos | Mia" />
        <meta
          property="og:description"
          content="Foot in the Door 5: Featured Artists Videos – Minneapolis Institute of Art #FootInTheDoor @artsmia"
        />
        <meta
          property="og:url"
          content="https://collections.artmsia.org/exhibitions/2760/foot-in-the-door/video"
        />
      </Head>
    </Layout>
  )
}

function VideoBox(props) {
  return (
    <figure key={props.vimeoId} className="group mt-1 mb-4">
      <div
        style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: '0',
        }}
      >
        <iframe
          loading="lazy"
          title={props.caption}
          src={`https://player.vimeo.com/video/${props.vimeoId}?color=ffffff&byline=0&title=0&portrait=0&texttrack=en`}
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        ></iframe>
      </div>
      <figcaption className="text-sm group-hover:visible bg-gray-200 p-1 px-2">
        <a
          href={`https://vimeo.com/${props.vimeoId}`}
          className="no-underline hover:underline"
        >
          {props.caption}
        </a>
      </figcaption>
    </figure>
  )
}

export default Video
