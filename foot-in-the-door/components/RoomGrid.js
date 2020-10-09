/** @format */
import Link from 'next/link'

import { getImageSrc } from '../util'

function RoomGrid(props) {
  const { hits, perPage, classification, ...containerProps } = props

  return (
    <section {...containerProps}>
      <p className="uppercase text-center mb-8 font-hairline">
        Scroll to enter <strong>{classification}</strong> wing
      </p>
      <div className="flex flex-wrap">
        {hits.slice(0, perPage).map((_hit) => {
          const { id, title, artist } = _hit._source

          return (
            <figure className="group" key={id}>
              <img
                src={getImageSrc(_hit._source)}
                className="flex-1 h-64 p-1"
              />
              <figcaption className="hidden group-hover:block max-w-full">
                <h2>{title}</h2>
                <h3>{artist}</h3>
                <Link href={`/art/${id}`}>
                  <a>&rarr;</a>
                </Link>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}

export default RoomGrid
