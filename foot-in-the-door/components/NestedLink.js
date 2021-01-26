/** @format */

import { useRouter } from 'next/router'
import Link from 'next/link'

/* TODO
 *
 * [ ] write tests
 * [ ] handle non-NextJS links (to external sites)
 */
function NestedLink({ children, href, external, ...props }) {
  const router = useRouter()
  if (external || href.match(/new.artsmia.org|collections.artsmia.org\/info/))
    return (
      <a href={href} {...props}>
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
    <Link {...props} href={nestedHref}>
      {children}
    </Link>
  )
}

export default NestedLink
