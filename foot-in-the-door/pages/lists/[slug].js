/** @format */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

import RoomGrid from 'components/RoomGrid'
import Text from 'components/Text'
import { getSearchResults } from 'util/index'

function List(props) {
  const {
    data: { name },
    artworks,
    content,
  } = props

  return (
    <main className="prose">
      <h1>{name}</h1>
      <RoomGrid
        className="mt-6 pt-24 sm:pt-0"
        classification={name}
        hits={artworks}
        focused={null}
        perPage={30}
        hideViewAll={true}
        label={name}
      >
        <Text>{content}</Text>
      </RoomGrid>
    </main>
  )
}

export default List

export async function getStaticPaths() {
  return {
    paths: [{ params: { id: '152140', slug: 'highlights-of-korean-art' } }],
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params

  const listDataFilePaths = [
    '../../collection-info/lists',
    '../../collection-info/lists/highlights',
  ].map((relative) => path.join(process.cwd(), relative, `${slug}.md`))
  const listDataFilePath = listDataFilePaths.find((path) => fs.existsSync(path))
  const { content, data } = matter(
    fs.readFileSync(listDataFilePath, { encoding: 'utf-8' })
  )

  const artworks = await getSearchResults(null, { ids: data.ids })

  return {
    props: {
      content,
      data,
      artworks,
    },
  }
}

/* TODO
 *
 * enable paginagtion
 * nest /art/:id under /lists/:slug
 *   add the "list" context on the art page
 * wrap in Layout
 */
