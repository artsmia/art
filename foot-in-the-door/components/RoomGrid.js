/** @format */
import Link from 'next/link'

import { getImageSrc } from '../util'

function RoomGrid(props) {
  const { hits, focused, perPage, classification, ...containerProps } = props

  const artworks = hits
    // When there is a 'focused' artwork, remove it from the grid so it
    // isn't shown both at the top of the page and in the 'see more' results.
    .filter((art) => art !== focused)
    .slice(0, perPage)

  return (
    <section {...containerProps}>
      <p className="uppercase text-center mb-8 font-hairline">
        Scroll to enter <strong>{classification}</strong> wing
      </p>
      <div className="flex flex-wrap">
        {artworks.map((art) => {
          const {
            _source: source,
            _source: { id, title, artist, description },
          } = art

          return (
            <figure className="group flex-grow" key={id}>
              <Link href={`/art/${id}`}>
                <a>
                  <img
                    src={getImageSrc(source)}
                    className="h-64 p-1"
                    alt={description}
                  />
                  <figcaption className="hidden group-hover:block max-w-full">
                    <h2>{title}</h2>
                    <h3>{artist}</h3>
                  </figcaption>
                </a>
              </Link>
            </figure>
          )
        })}
      </div>
    </section>
  )
}

export default RoomGrid
