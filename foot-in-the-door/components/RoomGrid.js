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

import {
  chunkArray,
  cx,
  getImageProps,
  useWindowSize,
  segmentTitle,
} from '../util'
import { ViewAllLink } from './NavBar'
import LikeControl from './LikeControl'
import ImageWithBackground from './ImageWithBackground'
import Text from 'components/Text'

function RoomGrid(props) {
  const {
    hits,
    focused,
    perPage,
    classification,
    label,
    text,
    children,
    hideLikeControl,
    exhibitionData,
    ...containerProps
  } = props

  // Custom settings on an exhibition-by-exhibition basis
  const {
    segmentArtTitles = true,
    gridSpacing = 4,
    gridMaxColumns = 11,
    gridMinColumns = 2,
    gridMinRows = 1,
  } = exhibitionData || {}

  const hideViewAll = true

  const grid = useGridState()

  const sliceSiblingArtworks = focused && true
  const focusedArtIndex =
    focused && hits.findIndex((hit) => hit._id === focused?.id)
  const artworks = sliceSiblingArtworks
    ? hits.slice(focusedArtIndex - perPage / 2, focusedArtIndex + perPage / 2)
    : hits.filter(({ _source: art }) => !!art).slice(0, perPage)

  // Columns as a function of window width.
  // This should be a log function or clamped somehow?
  const { width: windowWidth } = useWindowSize()
  const gridColsByWidth = windowWidth ? Math.floor(windowWidth / 234) : 2
  // uses `grid{Max,Min}Columns` which can be set on a per-exhibition
  // basis in the exhibition markdown setup file
  const gridColsInitial = Math.min(
    gridMaxColumns,
    Math.max(gridMinColumns, gridColsByWidth)
  )
  // Also take into consideration the number of artworks in the grid -
  // when the grid is small it's probably better to spread images across
  // at least two rows, so when `artworksLength < gridCols*n`, use a smaller
  // grid to coax out the minimim number of rows.
  const gridCols =
    gridColsInitial * gridMinRows >= artworks.length
      ? Math.floor(artworks.length / gridMinRows)
      : gridColsInitial
  // When the number of columns is reduced, `useFixedImageGrid` is needed
  // to modify the grid wrapper styling with a max-width and auto margins
  const useFixedImageGrid = gridCols < gridColsByWidth

  const {
    asPath: page,
    query: { exhibitionId: exhId, exhibitionSlug: exhSlug },
  } = useRouter()

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
            <strong>{classification}</strong>
          </p>
          <HiOutlineChevronDown className="mx-auto" aria-hidden="true" />
        </>
      )}
      <Grid
        {...grid}
        aria-label={label || 'Search Results'}
        className={cx('mt-8 mx-auto', useFixedImageGrid && 'w-2/3')}
      >
        {text && (
          <div className="max-w-3xl mx-auto mb-4">
            <Text dangerous={true}>{text}</Text>
          </div>
        )}
        {chunkArray(artworks, gridCols).map((row, rowIndex) => {
          return (
            <GridRow
              {...grid}
              key={rowIndex}
              className={`flex min-h-32 lg:min-h-48 max-h-96 mb-${gridSpacing} block`}
            >
              {row.map((art, cellIndex) => {
                const {
                  _source: source,
                  _source: {
                    id,
                    title: rawTitle,
                    artist: rawArtist,
                    description,
                    image_width,
                    image_height,
                  },
                } = art

                const artist = rawArtist.replace('Artist: ', '')
                const title = segmentArtTitles
                  ? segmentTitle(rawTitle)
                  : rawTitle

                const imageLoadStrategy = rowIndex < 2 ? 'eager' : 'lazy'
                const imageAspectRatio = image_width / image_height
                const landscapeImage = imageAspectRatio > 1
                const rightmostCell = cellIndex + 1 === row.length

                const imageProps = getImageProps(source)
                const { src: imageSrc } = imageProps
                const imageIsValid = imageProps.valid && imageProps.width > 0

                const isFocused = id === focused?.id

                const cell = (
                  <GridCell
                    {...grid}
                    as="a"
                    className={cx(
                      'relative group flex relative',
                      rightmostCell ? '' : `mr-${gridSpacing}`,
                      landscapeImage ? 'flex-grow' : 'flex-shrink'
                    )}
                  >
                    <ImageWithBackground as="figure" imageSrc={imageSrc}>
                      {imageIsValid ? (
                        <img
                          className="h-auto w-full max-h-full"
                          loading={imageLoadStrategy}
                          {...imageProps}
                          alt={description}
                        />
                      ) : (
                        <span {...imageProps} className="sticky top-2">
                          {title}
                        </span>
                      )}
                      <figcaption className="hidden absolute inset-x-0 bottom-0 min-h-full bg-black opacity-75 group-hover:flex max-w-full items-end">
                        <div className="text-white opacity-100 py-6 px-4">
                          <h2
                            className={
                              segmentArtTitles ? 'font-light' : 'font-bold'
                            }
                          >
                            {title}
                          </h2>
                          <h3
                            className={cx(
                              'hidden sm:inline-block',
                              segmentArtTitles ? 'font-bold' : ''
                            )}
                          >
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
                  </GridCell>
                )

                return isFocused ? (
                  <div className="opacity-25">{cell}</div>
                ) : (
                  <Link
                    href={`/exhibitions/${exhId}/${exhSlug}/art/${id}`}
                    passHref
                    key={id}
                  >
                    {cell}
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
