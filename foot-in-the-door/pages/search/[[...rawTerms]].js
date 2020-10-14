/** @format */
import Layout from '../../components/Layout'
import RoomGrid from '../../components/RoomGrid'
import SearchInput from '../../components/SearchInput'
import { getSearchResults } from '../../util'

function Search(props) {
  const { searchResults: results, rawTerms } = props
  const hits = results.hits ? results.hits.hits : results // searches and random querys return differently shaped JSON

  return (
    <Layout>
      <main>
        <h1 className="text-center text-5xl font-black capitalize">
          <SearchInput terms={rawTerms} />
        </h1>

        <RoomGrid
          classification={`"${rawTerms}"`}
          hits={hits}
          perPage={100}
          className="mt-32"
        />
      </main>
    </Layout>
  )
}

export default Search

// TODO convert to getStaticProps + getStaticPaths?
// Doesn't really make sensee for search as much as it does for the predefined rooms
export async function getServerSideProps({ params }) {
  const { rawTerms } = params
  const searchResults = await getSearchResults(rawTerms, { size: 55 })

  return {
    props: {
      rawTerms,
      searchResults,
    },
  }
}
