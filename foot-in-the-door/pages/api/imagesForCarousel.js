/** @format */
import { getImages } from '../../util'

export default async (req, res) => {
  const results = await getImages()

  res.statusCode = 200
  res.json(results)
}
