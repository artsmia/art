/** @format */
import { promises as fs } from 'fs'
import { getMiaExhibitionData, segmentTitle } from 'util/index'

/**
 * Redirect /:id to the same exhibition with title as :slug tagged on.
 */
function RedirectToExhibitionWithSlug() {
  return <span>Redirecting</span>
}

export default RedirectToExhibitionWithSlug

export async function getStaticProps({ params }) {
  const exhId = Number(params.exhibitionId)
  const { exhibition_title: title } = await getMiaExhibitionData(exhId, fs)
  const exhibitionSlug = segmentTitle(title, { returnJSX: false })[1]
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
