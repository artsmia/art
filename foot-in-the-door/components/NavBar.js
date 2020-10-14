/** @format */
import Link from 'next/link'

function NavBar() {
  return (
    <nav className="md:flex md:flex-row-reverse md:items-start md:justify-between">
      <div className="uppercase tracking-wider font-semibold">
        <a
          href="https://ticket.artsmia.org/products/donate"
          className="p-2 mx-5 hidden md:inline"
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
      <div className="pt-10 md:pt-0">
        <Link href="/">
          <a>
            <img
              alt="Minneapolis Institute of Art Logo"
              src="https://styleguide.staging.artsmia.org/src/images/mia-wordmark.svg"
              className="h-6"
            />
          </a>
        </Link>
        <a href="/foot-in-the-door">❮ Exit Exhibition</a>
      </div>
    </nav>
  )
}

export default NavBar
