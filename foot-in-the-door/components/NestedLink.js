/** @format */

import { useRouter } from 'next/router'
import Link from 'next/link'

// TODO write tests
function NestedLink({ children, href, ...props }) {
  const router = useRouter()
  const { exhibitionId, exhibitionSlug } = router.query
  const [, givenExhId, givenExhSlug] =
    href.match(/\/exhibitions\/(\d+)\/([^/]*)/) ?? []
  const givenHrefStripped = href.replace(/\/exhibitions\/\d+\/[^/]*/, '')
  const nestedHref = `/exhibitions/${exhibitionId || givenExhId}/${
    exhibitionSlug || givenExhSlug
  }/${givenHrefStripped}`.replace(/\/+/g, '/')

  return (
    <Link {...props} href={nestedHref}>
      {children}
    </Link>
  )
}

export default NestedLink
