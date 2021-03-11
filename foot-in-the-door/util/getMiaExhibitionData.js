/** @format */
import path from 'path'
import matter from 'gray-matter'

export async function getMiaExhibitionData(exhId, fs) {
  const baseDataR = await fetch(
    `http://cdn.dx.artsmia.org/exhibitions/${Math.floor(
      exhId / 1000
    )}/${exhId}.json`
  )
  const baseData = await baseDataR.json()

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
    mdData = frontMatter.isEmpty ? {} : frontMatter.data
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

  const { display_date } = baseData
  const [, endDate] = display_date.split(' - ').map((d) => new Date(d))
  // TODO how exactly to determine this? For now, tie it to FitD's ID
  const isClosed =
    Number(exhId) === 2760 && (new Date(endDate) < new Date() || true)

  const hideSearch = Number(exhId) !== 2760

  const data = {
    ...baseData,
    ...mdData,
    description: baseData.exhibition_description || extraDescription || null,
    extra: extraData,
    subPanels,
    isClosed,
    hideSearch,
  }

  return data
}
