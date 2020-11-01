/** @format */
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  unstable_useGridState as useGridState,
  unstable_Grid as Grid,
  unstable_GridRow as GridRow,
  unstable_GridCell as GridCell,
} from 'reakit/Grid'
import { HiOutlineChevronDown } from '@meronex/icons/hi'

import { chunkArray, cx, getImageProps, useWindowSize } from '../util'
import { ViewAllLink } from './NavBar'
import LikeControl from './LikeControl'
import ImageWithBackground from './ImageWithBackground'

function RoomGrid(props) {
  const {
    hits,
    focused,
    perPage,
    classification,
    label,
    children,
    hideLikeControl,
    ...containerProps
  } = props

  const hideViewAll = true

  const grid = useGridState()

  const artworks = hits
    // When there is a 'focused' artwork, remove it from the grid so it
    // isn't shown both at the top of the page and in the 'see more' results.
    .filter((art) => art !== focused)
    .filter(({ _source: art }) => !!art)
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
          {hideViewAll ||
            (page !== '/room/all' && (
              <ViewAllLink className="block text-center no-underline uppercase font-light">
                View All Groups
              </ViewAllLink>
            ))}
          <p className="uppercase text-center font-hairline">
            Scroll to enter <strong>{classification}</strong>
          </p>
          <HiOutlineChevronDown className="mx-auto" aria-hidden="true" />
        </>
      )}
      <Grid
        {...grid}
        aria-label={label || 'Search Results'}
        className="flex flex-wrap mt-8"
      >
        {chunkArray(artworks, gridCols).map((row, rowIndex) => {
          return (
            <GridRow
              {...grid}
              key={rowIndex}
              className="flex min-h-32 lg:min-h-48 max-h-96 my-2 block"
            >
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

                const imageProps = getImageProps(source)
                const { src: imageSrc } = imageProps

                return (
                  <Link href={`/art/${id}`} passHref key={id}>
                    <GridCell
                      {...grid}
                      as="a"
                      className={cx(
                        'relative group flex relative mx-2',
                        landscapeImage ? 'flex-grow' : 'flex-shrink'
                      )}
                    >
                      <figure>
                        <ImageWithBackground imageSrc={imageSrc}>
                          <img
                            className="h-auto w-full max-h-full"
                            loading={imageLoadStrategy}
                            {...imageProps}
                            alt={description}
                          />
                          <figcaption className="hidden absolute inset-0 bg-black opacity-75 group-hover:flex max-w-full items-end">
                            <div className="text-white opacity-100 py-6 px-4">
                              <h2 className="font-extrabold">{title}</h2>
                              <h3 className="font-light hidden sm:inline-block">
                                {artist}
                              </h3>
                            </div>
                            {hideLikeControl || (
                              <LikeControl
                                artwork={source}
                                className="p-6 hidden md:inline"
                                hydrateLocal={true}
                              />
                            )}
                          </figcaption>
                        </ImageWithBackground>
                      </figure>
                    </GridCell>
                  </Link>
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
