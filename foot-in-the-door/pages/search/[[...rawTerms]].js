/** @format */
import Layout from '../../components/Layout'
import RoomGrid from '../../components/RoomGrid'
import SearchInput from '../../components/SearchInput'
import { getSearchResults } from '../../util'

function Search(props) {
  const { size, searchResults: results, rawTerms } = props
  const hits = results.hits ? results.hits.hits : results // searches and random querys return differently shaped JSON

  return (
    <Layout hideCTA={true}>
      <main>
        <h1 className="text-center text-4xl font-black capitalize -mt-6">
          <SearchInput terms={rawTerms} />
        </h1>

        {rawTerms && (
          <RoomGrid
            classification={`"${rawTerms}"`}
            hits={hits}
            perPage={size || 100}
            className="mt-16"
            label={`Search results for "${rawTerms}"`}
          />
        )}
      </main>
    </Layout>
  )
}

export default Search

// TODO convert to getStaticProps + getStaticPaths?
// Doesn't really make sensee for search as much as it does for the predefined rooms
export async function getServerSideProps(context) {
  const {
    params: { rawTerms },
    query: { size },
  } = context
  const searchResults = await getSearchResults(rawTerms, {
    size: size || 321,
    useNormalSearch: true,
  })

  return {
    props: {
      rawTerms: rawTerms || null,
      searchResults,
      size: size || null,
    },
  }
}
