/** @format */
import Link from 'next/link'
import { HiSearch, HiX } from '@meronex/icons/hi'
import {
  useDialogState,
  Dialog,
  DialogDisclosure,
  DialogBackdrop,
} from 'reakit/Dialog'
import { useRouter } from 'next/router'

import { classifications, cx, useWindowSize } from '../util'
import SearchInput, { ExpandableSearchInput } from './SearchInput'

function NavBar() {
  // const [searchOpen, setSearchOpen] = useState(false)
  // const toggleSearchDrawer = () => setSearchOpen(!searchOpen)
  const expandedNavDialog = useDialogState()
  const { visible: searchDialogOpen } = expandedNavDialog
  const { route } = useRouter()
  const { width } = useWindowSize()
  const useDialogSearch = width < 769 // tailwind md:
  const isSearchPage = /search/.test(route)

  return (
    <nav className="flex flex-row items-start justify-between">
      <div className="w-4/5">
        <HomeLink route={route} />
        <BackLink route={route} />
      </div>
      {isSearchPage ||
        (useDialogSearch ? (
          <div>
            <DialogDisclosure {...expandedNavDialog} className="w-1/5">
              {searchDialogOpen ? (
                <HiX size="2rem" />
              ) : (
                <HiSearch size="2rem" />
              )}
            </DialogDisclosure>
            <DialogBackdrop {...expandedNavDialog}>
              <Dialog
                {...expandedNavDialog}
                aria-label="Search and Navigation"
                className="opacity-100"
              >
                <SmallScreenNav />
              </Dialog>
            </DialogBackdrop>
          </div>
        ) : (
          <ExpandableSearchInput className="ml-10" />
        ))}
    </nav>
  )
}

export default NavBar

export function JoinCTA({ isClosed, onClose }) {
  const closeProps = { onClick: onClose, onKeyPress: onClose }
  const linkAction = { onClick: (e) => e.stopPropagation() }

  return (
    <div className="md:flex md:flex-row md:justify-between" {...closeProps}>
      <p className="font-light">
        <JoinCTAPhrase linkAction={linkAction} />{' '}
        {isClosed || <HiX className="inline ml-4 -mt-1" />}
      </p>
      <div className="hidden xl:block uppercase tracking-wider font-semibold">
        <DonateLink />
        <BecomeAMemberLink
          className={`
            absolute -ml-4 -mt-4 mb-6 text-center w-screen 
            md:w-auto md:-ml-0 md:-mb-0 md:text-left md:relative
            `}
        />
      </div>
    </div>
  )
}

export function JoinCTAPhrase({ linkAction }) {
  return (
    <>
      <a href="https://ticket.artsmia.org/catalog/support-mia" {...linkAction}>
        Support Mia
      </a>{' '}
      by becoming a member today. Contributions keep us free and accessible,
      virtually and in-person.
    </>
  )
}

function SmallScreenNav() {
  const linkClasses = 'py-8 no-underline text-lg'
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 h-screen-4/5 bg-black text-white p-3">
      <SearchInput dark={true} className="mt-4" />
      <h3 className="font-bold text-2xl mt-8 tracking-wide ml-1">
        Browse by category
      </h3>
      <ul className="mt-4 font-light ml-1">
        {classifications.map((c) => (
          <li key={c}>
            <Link href={`/room/${c.toLowerCase()}`}>
              <a className={linkClasses}>{c}</a>
            </Link>
          </li>
        ))}
        <li className="mt-8">
          <ViewAllLink className={cx(linkClasses, 'font-bold uppercase')} />
        </li>
      </ul>
    </nav>
  )
}

export function ViewAllLink({ children, className }) {
  return (
    <Link href="/room/all">
      <a className={className}>{children || 'View All'}</a>
    </Link>
  )
}

function Logo() {
  return (
    <img
      alt="Minneapolis Institute of Art Logo"
      src="https://styleguide.staging.artsmia.org/src/images/mia-wordmark.svg"
      className="h-6"
    />
  )
}
function HomeLink({ route }) {
  const alwaysLinkToArtsmiaHome = true || route === '/'

  return alwaysLinkToArtsmiaHome ? (
    <a href="https://artsmia.org">
      <Logo />
    </a>
  ) : (
    <Link href="/">
      <a>
        <Logo />
      </a>
    </Link>
  )
}

function BackLink({ route }) {
  return route === '/' ? (
    <a
      href="https://new.artsmia.org/exhibitions/"
      className="font-light no-underline"
    >
      ❮ Exit Exhibition
    </a>
  ) : (
    <>
      <Link href="/">
        <a className="no-underline font-light">
          ❮<span>Foot in the Door</span> Exhibition Home
        </a>
      </Link>
    </>
  )
}

function DonateLink() {
  return (
    <a
      href="https://ticket.artsmia.org/products/donate"
      className="p-2 mx-5 hidden xl:inline"
    >
      Donate
    </a>
  )
}

export function BecomeAMemberLink({ className }) {
  return (
    <a
      href="https://ticket.artsmia.org/products/membership"
      className={cx(className, 'p-2 px-4 bg-black text-white no-underline')}
    >
      Become a Member
    </a>
  )
}
