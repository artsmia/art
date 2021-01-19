/** @format */
import Link from 'next/link'
import { HiSearch, HiX, HiOutlineChevronLeft } from '@meronex/icons/hi'
import {
  useDialogState,
  Dialog,
  DialogDisclosure,
  DialogBackdrop,
} from 'reakit/Dialog'
import { useRouter } from 'next/router'

import { classifications, cx, useWindowSize } from '../util'
import SearchInput, { ExpandableSearchInput } from './SearchInput'

function NavBar({ hideSearch }) {
  // const [searchOpen, setSearchOpen] = useState(false)
  // const toggleSearchDrawer = () => setSearchOpen(!searchOpen)
  const expandedNavDialog = useDialogState()
  const { visible: searchDialogOpen } = expandedNavDialog
  const router = useRouter()
  const { route } = router
  const { width } = useWindowSize()
  const useDialogSearch = width < 769 // tailwind md:
  const isSearchPage = /search/.test(route)

  return (
    <nav className="flex flex-row items-start justify-between">
      <div className="w-48 sm:w-auto md:flex md:flex-grow md:justify-between md:flex-wrap">
        <LogoLink route={route} className="mb-2" />
        <div className="text-sm uppercase">
          <ExhibitionHomeLink route={route} router={router} />
          <ExitExhibitionLink route={route} />
        </div>
      </div>
      {isSearchPage ||
        hideSearch ||
        (useDialogSearch ? (
          <div>
            <DialogDisclosure {...expandedNavDialog} className="w-12">
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
          <ExpandableSearchInput className="ml-10 -mt-2" />
        ))}
    </nav>
  )
}

export default NavBar

export function JoinCTA({ isClosed, onClose }) {
  const showCloseButton = false
  const closeProps = { onClick: onClose, onKeyPress: onClose }
  const stopPropagation = { onClick: (e) => e.stopPropagation() }

  return (
    <div className="md:flex md:flex-row md:justify-between" {...closeProps}>
      <p className="font-light">
        <JoinCTAPhrase linkAction={stopPropagation} />{' '}
        {showCloseButton && (isClosed || <HiX className="inline ml-4 -mt-1" />)}
      </p>
      <div className="hidden xl:block uppercase tracking-wider font-semibold text-sm">
        <DonateLink onClick={stopPropagation} />
        <BecomeAMemberLink onClick={stopPropagation} />
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
function LogoLink({ route, ...props }) {
  const alwaysLinkToArtsmiaHome = true || route === '/'

  return alwaysLinkToArtsmiaHome ? (
    <a href="https://artsmia.org" {...props}>
      <Logo />
    </a>
  ) : (
    <Link href="/">
      <a {...props}>
        <Logo />
      </a>
    </Link>
  )
}

function ExhibitionHomeLink({ route, router, className }) {
  const { width } = useWindowSize()
  const { exhibitionId: id, exhibitionSlug: slug } = router.query
  const exhibitionName = slug?.replace(/-/g, ' ')
  const chevronLeft = (
    <HiOutlineChevronLeft
      className="inline -mt-1 md:hidden"
      aria-hidden="true"
    />
  )

  const linkStyles = `font-light no-underline hover:underline md:text-gray-400`

  const atExhibitionHome =
    route === '/exhibitions/[exhibitionId]/[exhibitionSlug]'

  if (route === '/') return null

  return atExhibitionHome && width < 768 ? (
    <a
      href="https://new.artsmia.org/exhibitions/"
      className={cx(className, linkStyles)}
    >
      {chevronLeft} Exit Exhibition
    </a>
  ) : (
    <>
      <Link href={`/exhibitions/${id}/${slug}`}>
        <a className={cx(className, linkStyles)}>
          {chevronLeft}
          <span className="sm:hidden">{exhibitionName}</span>{' '}
          <span className="hidden sm:inline">Exhibition</span> Home
        </a>
      </Link>
    </>
  )
}

function ExitExhibitionLink({ route, className, ...props }) {
  if (route === '/') return null

  return (
    <a
      href="https://new.artsmia.org/exhibitions"
      className={cx(
        'border no-underline font-bold p-2 ml-2 hidden md:inline',
        'hover:bg-black hover:text-white',
        className
      )}
      {...props}
      title="Show All Exhibitions at Mia"
    >
      Exit Exhibition
    </a>
  )
}

function DonateLink() {
  return (
    <a
      href="https://ticket.artsmia.org/products/donate"
      className="p-2 mx-5 hidden xl:inline no-underline"
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

export function SupportCTA() {
  return (
    <div className="p-8 bg-gray-200 mt-4 sm:max-w-96 sm:mx-auto sm:-mt-40 text-center hover:bg-gray-300 group">
      <JoinCTAPhrase />
      <br />
      <BecomeAMemberLink className="mt-2 inline-block text-center w-auto mx-auto uppercase" />
    </div>
  )
}
