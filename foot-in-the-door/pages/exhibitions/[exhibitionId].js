/** @format */
import { promises as fs } from 'fs'
import { getMiaExhibitionIdAndData, segmentTitle } from 'util/index'

/**
 * Redirect /:id to the same exhibition with title as :slug tagged on.
 */
function RedirectToExhibitionWithSlug() {
  return <span>Redirecting</span>
}

export default RedirectToExhibitionWithSlug

export async function getStaticProps({ params }) {
  const [exhId, exhibitionData] = await getMiaExhibitionIdAndData(params.exhibitionId, fs)
  const { slug, exhibition_title: title } = exhibitionData
  const exhibitionSlug = slug || segmentTitle(title, { returnJSX: false })[1]
    .toLowerCase()
    .replace(/\s+/g, '-')

  return {
    redirect: {
      destination: `/exhibitions/${exhId}/${exhibitionSlug}`,
      permanent: true,
    }
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}
