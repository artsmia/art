/** @format */
import Layout from '../../../components/Layout'
import RoomGrid from '../../../components/RoomGrid'
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
        <img
          src={getImageSrc(artwork)}
          alt={description}
          className="w-2/3 px-4"
        />
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-black capitalize">{title}</h1>
            <h2 className="text-xl font-bold">
              {artist}, <span className="text-base font-normal">{dated}</span>
            </h2>
            <p>{medium}</p>
            <p>{dimension}</p>
            <p>( color )</p>
            <p className="py-4">{description}</p>
            <p>Keywords: {keywords}</p>
          </div>

          <div className="border-t-2 self-end">
            <p>Share: [mail] [twitter] [facebook]</p>
            <p className="bg-gray-300 px-4 py-2 mt-4">
              Keep Mia open, free, and accessible to all virtually and in-person
              <a href="https://ticket.artsmia.org/">
                by becoming a member or donating
              </a>
              today. We are always grateful to our members.
            </p>
          </div>
        </div>
      </main>

      <RoomGrid
        className="mt-6"
        classification={classification}
        hits={classificationResults}
        perPage={30}
      />
    </Layout>
  )
}

export default Art

// TODO convert to getStaticProps + getStaticPaths
export async function getServerSideProps({ params }) {
  const { id } = params
  // TODO redirect `/[id]` to canonical `/[id]/[slug]`

  const artwork = await fetchById(id)
  const classification = artwork.classification.toLowerCase().replace(' ', '-')
  const classificationResults = await getSearchResults(
    `classification:${classification}`
  )

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
