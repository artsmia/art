/** @format */
import path from 'path'
import matter from 'gray-matter'
import { segmentTitle } from 'util/index'

export async function getMiaExhibitionData(exhId, fs) {
  const baseDataR = await fetch(
    `http://cdn.dx.artsmia.org/exhibitions/${Math.floor(
      exhId / 1000
    )}/${exhId}.json`
  )
  let baseData
  try {
    baseData = await baseDataR.json()
  } catch (e) {
    baseData = {}
  }

  // TODO
  //
  // fs should be imported here, instead of passed as an arg, but that fails to compile
  // why can't I `import fs` in this file?
  // https://nextjs.org/docs/basic-features/data-fetching#reading-files-use-processcwd
  let extraData
  try {
    const exhibitionDataPath = path.join(
      process.cwd(),
      `data/exhibitions/${exhId}.json`
    )
    const extraDataRaw = await fs.readFile(exhibitionDataPath, {
      encoding: 'utf-8',
    })
    extraData = JSON.parse(extraDataRaw)
  } catch (e) {
    extraData = []
  }
  // de-dupe JSON/MD file loading?
  let mdData
  try {
    const exhibitionDataPath = path.join(
      process.cwd(),
      `data/exhibitions/${exhId}.md`
    )
    const mdDataRaw = await fs.readFile(exhibitionDataPath, {
      encoding: 'utf-8',
    })
    const frontMatter = matter(mdDataRaw)
    mdData = frontMatter.isEmpty
      ? {}
      : {
          ...frontMatter.data,
          markdownContent: frontMatter.content,
        }
  } catch (e) {
    mdData = {}
  }

  const mainPanel =
    extraData.find(
      (data) =>
        data['ID Type'] === 'ExhibitionId' && data.UniqueId === Number(exhId)
    ) ?? extraData[0]
  const extraDescription = mainPanel?.Text

  const subPanels = extraData
    .filter((d) => d['Record type'] === 'SubPanel')
    .map((panel) => {
      panel.artworkIds =
        extraData
          .filter((d) => d.ParentID === panel.UniqueID)
          .map((art) => art.UniqueID) ?? null

      // panel.nextPanel = extraData[extraData.indexOf(panel) + 2]
      // panel.prevPanel = extraData[extraData.indexOf(panel) - 1]

      return panel
    })

  // const { display_date } = baseData
  // const [, endDate] = display_date?.split(' - ').map((d) => new Date(d)) ?? []
  // TODO how exactly to determine this? For now, tie it to FitD's ID
  // [ ] refactor based on frontMatter in exhibition markdown file?
  const isClosed = Number(exhId) === 2760 // && (new Date(endDate) < new Date() || true)

  // TODO how to limit the search to only include items within
  // the current exhibition? This is possible for auxilary data
  // exhibitions which use their own independent ES index
  // But will need more thinking to search the full objects[1-2] ES
  // index when results from outside a given exhibition shouldn't be returned?
  const hideSearch = [2760, 2897].indexOf(Number(exhId)) < 0

  const slug = (
    mdData.slug ||
    segmentTitle(baseData.exhibition_title, { returnJSX: false })[1]
  )
    .toLowerCase()
    .replace(/\s+/g, '-')

  const data = {
    ...baseData,
    ...mdData,
    description: baseData.exhibition_description || extraDescription || null,
    extra: extraData,
    subPanels,
    isClosed,
    hideSearch,
    slug,
  }

  return data
}

export async function getMiaExhibitionIdAndData(_exhId, fs) {
  if (_exhId === '32021') _exhId = 2898
  const exhId = Number(_exhId)
  const exhibitionData = await getMiaExhibitionData(exhId, fs)

  return [exhId, exhibitionData]
}
