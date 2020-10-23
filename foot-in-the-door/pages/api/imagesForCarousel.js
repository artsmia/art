/** @format */
import { classifications, getSearchResults } from '../../util'

/**
 * fetch one artwork from each `classification`
 * and return all as json
 */
export async function getImages(size) {
  const results = await Promise.all(
    classifications.map(async function (c) {
      const json = await getSearchResults(`classification:${c}`, {
        size: size || 1,
      })
      return json
    })
  )

  return results
}

export default async (req, res) => {
  const results = await getImages()

  res.statusCode = 200
  res.json(results)
}
