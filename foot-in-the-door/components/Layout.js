/** @format */
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import Link from 'components/NestedLink'
import { cx } from '../util'
import NavBar, { JoinCTA } from '../components/NavBar'
import { ConditionalSurvey } from '../components/Survey'
import { titleCase } from 'util/index'

function Layout(props) {
  const { stickyCTA, stickyFooter, hideCTA, pageBlocked } = props
  const [ctaClosed, setCTAClosed] = useState(!stickyCTA)

  const { query } = useRouter()
  const isFitD = Number(query.exhibitionId) === 2760

  useEffect(() => {
    if (!localStorage) return
    try {
      const data = JSON.parse(localStorage.getItem('artsmia-fitd') || '{}')
      const nextData = {
        ...data,
        visitCount: (data.visitCount || 0) + 1,
      }

      localStorage.setItem('artsmia-fitd', JSON.stringify(nextData))
    } catch (e) {
      // localStorage failure
    }
  }, [])

  // TODO generalize this
  // either by making it "Mia Collecitons" in geneeral here, and re-setting it from components further down the tree
  // or by passing data into Layout?
  // or by pulling context from useRouter and massaging it into a title?
  // (or a combination?)
  const titleFromRouter = query.exhibitionSlug
    ? titleCase(query.exhibitionSlug?.replace(/-/g, ' '))
    : ''
  const [pageTitle, pageDescription] = isFitD
    ? [
        'Foot in the Door: The Virtual Exhibition',
        'Held once every 10 years, “Foot in the Door” is an open exhibition for all Minnesota artists. Now marking its fourth decade, this exhibition celebrates the talent, diversity, and enthusiasm of Minnesota’s visual artists. This is an important event for the arts community and a great opportunity for artists to display their work at Mia. The sole curatorial criteria? Each submission must fit within one cubic foot.',
      ]
    : [`${titleFromRouter} | Mia`, '']

  return (
    <>
      {pageBlocked && (
        <aside className="fixed z-30 inset-0">
          <div className="fixed inset-x-0 bottom-0 h-screen-3/5 opacity-1 bg-white z-40 p-24">
            <p>
              <em>Foot in the Door 5: The Virtual Exhibition</em> was held from
              November 1, 2020, to January 10, 2021. The online exhibition
              showcased the works of over 2,000 Minnesota artists, with the
              unifying criteria that each piece measure less than one cubic
              foot.{' '}
              <a href="https://new.artsmia.org/exhibition/foot-in-the-door-5/">
                Back to exhibition listing
              </a>
              .
            </p>
            <p className="mt-4">
              If you are looking for a specific work that was featured in Foot
              in the Door for historical reference purposes,{' '}
              <Link href={'/search'}>search here</Link>.
            </p>
          </div>
          <hr className="fixed top-0 inset-x-0 opacity-25" />
        </aside>
      )}
      <div
        className={cx(
          'p-4 md:px-16 md:py-5 text-gray-900',
          pageBlocked ? 'opacity-25 overflow-hidden' : ''
        )}
      >
        <Head>
          <title>{pageTitle}</title>
          <link rel="icon" href="/favicon.ico" />
          {isFitD && (
            <meta
              name="Description"
              content={pageDescription}
              key="description"
            />
          )}
        </Head>

        <header className="mb-12">
          <NavBar hideSearch={props.hideSearch} />
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
          {isFitD && (
            <>
              <SponsorLockup />
              {false && <ConditionalSurvey />}
              <p className="mt-2 font-lignt text-xs text-center">
                The concepts expressed in this show are those of the artists,
                not the museum. Please direct inquiries to visit@artsmia.org.
              </p>
            </>
          )}
        </footer>
        <UserSurveillance />
      </div>
    </>
  )
}

export default Layout

function SponsorLockup() {
  return (
    <ol id="sponsor-lockup" className="md:flex flex-row">
      <div className="text-xs md:w-2/3 flex-shrink-0 lg:flex lg:border-t-2 lg:mt-4 border-black">
        <li className="border-t-2 lg:border-t-0 mt-4 lg:mt-0 border-black min-w-72">
          Lead Sponsors:
          <div className="flex flex-wrap content-between">
            <Logo name="thomson-reuters" />
            <Logo name="target" />
          </div>
        </li>
        <li className="border-t-2 lg:border-t-0 mt-4 lg:mt-0 lg:pl-4 xl:pl-32 border-black flex justify-start">
          <p>
            Major Sponsor:
            <Logo name="delta" />
          </p>
          <p className="ml-12">
            Media Sponsor:
            <Logo name="startribune" />
          </p>
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
    'h-10 ml-6 mt-1',
    'https://target.com',
  ],
  'thomson-reuters': [
    'thomson-reuters.svg',
    'Thomson Reuters Corporation',
    'h-8 mt-3',
    'https://www.thomsonreuters.com/',
  ],
  startribune: [
    'startribune.svg',
    'StarTribune',
    'h-5 mt-2',
    'https://www.startribune.com',
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

function UserSurveillance() {
  return (
    <>
      <script
        src="https://moth.artsmia.org/script.js"
        site="PXCWTLRI"
        spa="auto"
        defer
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-WWCWDGS');`,
        }}
      ></script>
    </>
  )
}
