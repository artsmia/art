/** @format */

import { useRouter } from 'next/router'
import Link from 'next/link'

/* TODO
 *
 * [ ] write tests
 * [ ] handle non-NextJS links (to external sites)
 */
function NestedLink({ children, href, external, ...linkProps }) {
  const router = useRouter()
  if (external || href.match(/new.artsmia.org|collections.artsmia.org\/info/))
    return (
      <a href={href} {...linkProps}>
        {children}
      </a>
    )

  const { exhibitionId, exhibitionSlug } = router.query
  const [, givenExhId, givenExhSlug] =
    href.match(/\/exhibitions\/(\d+)\/([^/]*)/) ?? []
  const givenHrefStripped = href.replace(/\/exhibitions\/\d+\/[^/]*/, '')
  const nestedHref = `/exhibitions/${exhibitionId || givenExhId}/${
    exhibitionSlug || givenExhSlug
  }/${givenHrefStripped}`.replace(/\/+/g, '/')

  return (
    <Link href={nestedHref}>
      <a {...linkProps}>{children}</a>
    </Link>
  )
}

export default NestedLink
