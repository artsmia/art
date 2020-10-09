/** @format */
import Head from 'next/head'

import NavBar from '../components/NavBar'

function Layout(props) {
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
