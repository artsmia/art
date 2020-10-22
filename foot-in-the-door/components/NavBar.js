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

import { classifications } from '../util'
import SearchInput from './SearchInput'

function NavBar() {
  // const [searchOpen, setSearchOpen] = useState(false)
  // const toggleSearchDrawer = () => setSearchOpen(!searchOpen)
  const expandedNavDialog = useDialogState()
  const { visible: searchOpen } = expandedNavDialog
  const router = useRouter()
  const logo = (
    <img
      alt="Minneapolis Institute of Art Logo"
      src="https://styleguide.staging.artsmia.org/src/images/mia-wordmark.svg"
      className="h-6"
    />
  )
  const homeLink =
    router.route === '/' ? (
      <a href="https://artsmia.org">{logo}</a>
    ) : (
      <Link href="/">
        <a>{logo}</a>
      </Link>
    )

  const backLink =
    router.route === '/' ? (
      <a href="https://new.artsmia.org/exhibitions/">❮ Exit Exhibition</a>
    ) : (
      <>
        <Link href="/">
          <a>
            ❮<span>Foot in the Door</span> Exhibition Home
          </a>
        </Link>
      </>
    )

  return (
    <nav className="flex flex-row items-start justify-between">
      <div className="w-4/5">
        {homeLink}
        {backLink}
      </div>
      <div>
        <DialogDisclosure {...expandedNavDialog} className="w-1/5">
          {searchOpen ? <HiX size="2rem" /> : <HiSearch size="2rem" />}
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
    </nav>
  )
}

export default NavBar

export function JoinCTA({ isClosed, onClose }) {
  const closeButton = isClosed || (
    <button onClick={onClose} onKeyPress={onClose}>
      <HiX />
    </button>
  )

  return (
    <div className="md:flex md:flex-row md:justify-between">
      <p className="">
        <a href="https://ticket.artsmia.org/catalog/support-mia">Support Mia</a>{' '}
        by becoming a member today. Contributions keep us free and accessible,
        virtually and in-person.
        {closeButton}
      </p>
      <div className="hidden xl:block uppercase tracking-wider font-semibold">
        <a
          href="https://ticket.artsmia.org/products/donate"
          className="p-2 mx-5 hidden xl:inline"
        >
          Donate
        </a>
        <a
          href="https://ticket.artsmia.org/products/membership"
          className="
            p-2 px-4 bg-gray-900 text-white w-screen
            absolute -ml-4 -mt-4 mb-6 text-center
            md:w-auto md:-ml-0 md:-mb-0 md:text-left md:relative
          "
        >
          Become a Member
        </a>
      </div>
    </div>
  )
}

function SmallScreenNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 h-screen-4/5 bg-black text-white p-3">
      <SearchInput dark={true} />
      <h3 className="font-bold text-2xl">Browse by category</h3>
      <ul className="">
        {classifications.map((c) => (
          <li key={c}>
            <Link href={`/room/${c.toLowerCase()}`}>{c}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
