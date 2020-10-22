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
          stickyCTA && !ctaClosed ? 'sticky' : 'my-4'
        )}
      >
        <JoinCTA onClose={() => setCTAClosed(true)} isClosed={ctaClosed} />
      </aside>

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

export default Layout
