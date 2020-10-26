/** @format */
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  unstable_useGridState as useGridState,
  unstable_Grid as Grid,
  unstable_GridRow as GridRow,
  unstable_GridCell as GridCell,
} from 'reakit/Grid'

import { chunkArray, cx, getImageProps, useWindowSize } from '../util'
import { ViewAllLink } from './NavBar'

function RoomGrid(props) {
  const {
    hits,
    focused,
    perPage,
    classification,
    children,
    ...containerProps
  } = props

  const grid = useGridState()

  const artworks = hits
    // When there is a 'focused' artwork, remove it from the grid so it
    // isn't shown both at the top of the page and in the 'see more' results.
    .filter((art) => art !== focused)
    .slice(0, perPage)

  // Columns as a function of window width.
  // This should be a log function or clamped somehow?
  // Ideally, small screens get 2 columns, and big screens get a max of 5?
  // default to 2 for server rendered pages for mobile first
  const { width: windowWidth } = useWindowSize()
  const gridCols = windowWidth
    ? Math.min(5, Math.max(2, Math.floor(windowWidth / 234)))
    : 2

  const { asPath: page } = useRouter()

  return (
    <section {...containerProps}>
      {children || (
        <>
          {page !== '/room/all' && (
            <ViewAllLink className="block text-center no-underline uppercase font-light">
              View All Groups
            </ViewAllLink>
          )}
          <p className="uppercase text-center mb-8 font-hairline">
            Scroll to enter <strong>{classification}</strong>
          </p>
        </>
      )}
      <Grid {...grid} aria-label="Search Results" className="flex flex-wrap">
        {chunkArray(artworks, gridCols).map((row, rowIndex) => {
          return (
            <GridRow {...grid} key={rowIndex} className="flex min-h-64 my-2">
              {row.map((art) => {
                const {
                  _source: source,
                  _source: {
                    id,
                    title,
                    artist,
                    description,
                    image_width,
                    image_height,
                  },
                } = art

                const imageLoadStrategy = rowIndex < 2 ? 'eager' : 'lazy'
                const imageAspectRatio = image_width / image_height
                const landscapeImage = imageAspectRatio > 1

                return (
                  <GridCell
                    {...grid}
                    key={id}
                    as="figure"
                    className={cx(
                      'group flex relative mx-2',
                      landscapeImage ? 'flex-grow' : 'flex-shrink'
                    )}
                  >
                    <Link href={`/art/${id}`}>
                      <a>
                        <img
                          className="h-auto w-full"
                          loading={imageLoadStrategy}
                          {...getImageProps(source)}
                          alt={description}
                        />
                        <figcaption className="hidden absolute inset-0 bg-black opacity-75 group-hover:flex max-w-full items-end">
                          <div className="text-white opacity-100 py-6 px-4">
                            <h2 className="font-extrabold">{title}</h2>
                            <h3 className="font-light">{artist}</h3>
                          </div>
                        </figcaption>
                      </a>
                    </Link>
                  </GridCell>
                )
              })}
            </GridRow>
          )
        })}
      </Grid>
    </section>
  )
}

export default RoomGrid
