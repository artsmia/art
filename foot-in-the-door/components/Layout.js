/** @format */
import { useState } from 'react'
import Head from 'next/head'

import { cx } from '../util'
import NavBar, { JoinCTA } from '../components/NavBar'

function Layout(props) {
  const { stickyCTA } = props
  const [ctaClosed, setCTAClosed] = useState(false)

  return (
    <div className="p-4 md:px-16 md:py-5 text-gray-900">
      <Head>
        <title>Foot in the Door</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="mb-6 md:mb-16">
        <NavBar />
      </header>

      {props.children}

      <aside
        className={cx(
          'inset-x-0 bottom-0 bg-gray-400 py-2 px-8 -mx-4',
          stickyCTA && !ctaClosed ? 'sticky lg:static lg:my-4' : 'my-4'
        )}
      >
        <JoinCTA onClose={() => setCTAClosed(true)} isClosed={ctaClosed} />
      </aside>

      <footer className="">
        <SponsorLockup />
      </footer>
    </div>
  )
}

export default Layout

function SponsorLockup() {
  return (
    <dl id="sponsor-lockup" className="md:flex flex-row">
      <div className="border-t-2 flex-row md:w-2/3">
        <dt>Lead Sponsors:</dt>
        <dd className="flex flex-wrap content-between">
          <Logo name="thomson-reuters" />
          <Logo name="target" />
        </dd>
        <dt className="border-t-2 mt-4">Major Sponsor:</dt>
        <dd>
          <Logo name="delta" />
        </dd>
      </div>
      <dt className="border-t-2 mt-4 sr-only">
        <span className="invisible h-1 m-0 p-0">MN State Sponsors</span>
      </dt>
      <dd
        className="sm:flex sm:flex-row md:block border-t-2 mt-4 pt-2
        md:w-1/3 md:border-t-0 md:border-l-2 md:pt-0 md:pl-2 md:mt-0 md:ml-2"
      >
        <p className="w-1/2 flex">
          <Logo name="msab" />
          <Logo name="mn-legacy" />
        </p>
        <p className="text-xs sm:ml-4 md:ml-0">
          This activity is made possible by the voters of Minnesota through a
          Minnesota State Arts Board Operating Support grant, thanks to a
          legislative appropriation from the arts and cultural heritage fund.
        </p>
      </dd>
    </dl>
  )
}

const logos = {
  delta: ['delta.svg', 'Delta Airlines', 'h-10'],
  'mn-legacy': ['mn-legacy.svg', 'Minnesota Legacy Amendment', 'h-32'],
  msab: ['msab.svg', 'Minnesota State Arts Board', 'h-32'],
  target: ['target.svg', 'Target Corporation', 'h-10'],
  'thomson-reuters': [
    'thomson-reuters.svg',
    'Thomson Reuters Corporation',
    'h-10',
  ],
}

function Logo(props) {
  const { name } = props
  const [filepath, alt, style] = logos[name]
  const basePath = '/exhibitions/2760/foot-in-the-door' // TODO can this be pulled from next config?

  return (
    <img
      src={`${basePath}/images/${filepath}`}
      alt={`${alt} Logo`}
      className={`mr-2 ${style}`}
    />
  )
}
