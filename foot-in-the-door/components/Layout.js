/** @format */
import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { cx } from '../util'
import NavBar, { JoinCTA } from '../components/NavBar'
import { ConditionalSurvey } from '../components/Survey'

function Layout(props) {
  const { stickyCTA, stickyFooter, hideCTA } = props
  const [ctaClosed, setCTAClosed] = useState(!stickyCTA)

  return (
    <div className="p-4 md:px-16 md:py-5 text-gray-900">
      <Head>
        <title>Foot in the Door</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="mb-12">
        <NavBar />
      </header>

      <aside
        className={cx(
          `inset-x-0 top-0 bg-gray-300 py-2 px-8 md:px-16 -mx-4 -mt-3 mb-12
           md:-mx-16 w-screen`,
          stickyCTA && !ctaClosed ? 'sticky z-20' : '',
          hideCTA ? 'hidden' : ''
        )}
      >
        <JoinCTA onClose={() => setCTAClosed(true)} isClosed={ctaClosed} />
      </aside>

      {props.children}

      <footer
        className={cx(
          stickyFooter
            ? 'md:sticky md:bottom-0 md:bg-white md:w-screen md:-ml-16 md:px-16 md:z-10'
            : '',
          'mt-16'
        )}
      >
        <SponsorLockup />
        <ConditionalSurvey />
        <p className="font-lignt text-xs text-center">
          The concepts expressed in this show are those of the artists, not the
          museum. Please direct inquiries to visit@artsmia.org.
        </p>
      </footer>
    </div>
  )
}

export default Layout

function SponsorLockup() {
  return (
    <ol id="sponsor-lockup" className="md:flex flex-row">
      <div className="text-xs md:w-2/3 flex-shrink-0 lg:flex lg:border-t-2 lg:mt-4 border-black">
        <li className="border-t-2 lg:border-t-0 mt-4 lg:mt-0 border-black">
          Lead Sponsors:
          <div className="flex flex-wrap content-between">
            <Logo name="thomson-reuters" />
            <Logo name="target" />
          </div>
        </li>
        <li className="border-t-2 lg:border-t-0 mt-4 lg:mt-0 lg:pl-16 xl:pl-48 border-black">
          Major Sponsor:
          <Logo name="delta" />
        </li>
      </div>
      <li className="border-t-2 mt-4 border-black">
        <span className="sr-only h-1 m-0 p-0">MN State Sponsors</span>
        <div
          className="flex flex-row pt-2 md:block md:border-l-2 md:pt-0 md:pl-2
          md:mt-0 md:ml-2 md:mt-2 lg:border-l-0 lg:flex border-black"
        >
          <p className="flex flex-shrink-0">
            <Logo name="msab" />
            <Logo name="mn-legacy" />
          </p>
          <p className="text-xs sm:mt-1 lg:mt-0 flex-shrink">
            This activity is made possible by the voters of Minnesota through a
            Minnesota State Arts Board Operating Support grant, thanks to a
            legislative appropriation from the arts and cultural heritage fund.
          </p>
        </div>
      </li>
    </ol>
  )
}

const logos = {
  delta: ['delta.svg', 'Delta Airlines', 'h-4 mt-4', 'https://www.delta.com'],
  'mn-legacy': [
    'mn-legacy.svg',
    'Minnesota Legacy Amendment',
    'h-24 pb-2',
    'https://www.legacy.mn.gov/',
  ],
  msab: [
    'msab.svg',
    'Minnesota State Arts Board',
    'h-24 pb-2',
    'http://www.arts.state.mn.us/',
  ],
  target: [
    'target.svg',
    'Target Corporation',
    'h-10 ml-8 mt-1',
    'https://target.com',
  ],
  'thomson-reuters': [
    'thomson-reuters.svg',
    'Thomson Reuters Corporation',
    'h-8 mt-3',
    'https://www.thomsonreuters.com/',
  ],
}

function Logo(props) {
  const { name } = props
  const [filepath, alt, style, link] = logos[name]
  const { basePath } = useRouter()

  return (
    <a href={link} title={alt}>
      <img
        src={`${basePath}/images/${filepath}`}
        alt={`${alt} Logo`}
        className={`mr-2 ${style}`}
      />
    </a>
  )
}
