/** @format */
import Layout from '../../../components/Layout'
import { fetchById, getImageSrc, getSearchResults } from '../../../util'

function Art(props) {
  const {
    artwork,
    artwork: {
      title,
      artist,
      medium,
      dated,
      description,
      keywords,
      dimension,
      classification,
    },
    classificationResults,
  } = props

  return (
    <Layout>
      <main className="flex align-start">
        <img src={getImageSrc(artwork)} alt={description} className="w-2/3" />
        <div>
          <h1>{title}</h1>
          <h2>
            {artist}, <span>{dated}</span>
          </h2>
          <p>{medium}</p>
          <p>{dimension}</p>
          <p>( color )</p>
          <p className="py-4">{description}</p>
          <p>Keywords: {keywords}</p>
        </div>
      </main>

      <section>
        {classificationResults.length} related by classification
      </section>
    </Layout>
  )
}

export default Art

// TODO convert to getStaticProps + getStaticPaths
export async function getServerSideProps({ params }) {
  const { id, slug } = params

  const artwork = await fetchById(id)
  const classification = artwork.classification.toLowerCase().replace(' ', '-')
  const classificationResults = await getSearchResults(
    `classification:${classification}`
  )
  console.info('getServerSideProps', {
    id,
    slug,
    params,
    artwork,
    classificationResults,
  })

  return {
    props: {
      id,
      artwork,
      classificationResults,
    },
  }
}

export async function _getStaticPaths() {
  return {
    paths: [1, 2, 3].map((id) => {
      const slug = ''

      return { params: { artwork: [id, slug] } }
    }),
    fallback: true,
  }
}
