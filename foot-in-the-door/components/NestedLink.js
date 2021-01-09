/** @format */

import { useRouter } from 'next/router'
import Link from 'next/link'

function NestedLink({ children, href, ...props }) {
  const router = useRouter()
  const { exhibitionId, exhibitionSlug } = router.query
  const givenHrefStripped = href.replace(/\/exhibitions\/\d+\/[^/]*\//, '')
  const nestedHref = `/exhibitions/${exhibitionId}/${exhibitionSlug}/${givenHrefStripped}`.replace(
    /\/+/g,
    '/'
  )

  return (
    <Link {...props} href={nestedHref}>
      {children}
    </Link>
  )
}

export default NestedLink
