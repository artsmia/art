/** @format */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  unstable_useGridState as useGridState,
  unstable_Grid as Grid,
  unstable_GridRow as GridRow,
  unstable_GridCell as GridCell,
} from 'reakit/Grid'

import { getImageSrc } from '../util'

function RoomGrid(props) {
  const { hits, focused, perPage, classification, ...containerProps } = props

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

  return (
    <section {...containerProps}>
      <p className="uppercase text-center mb-8 font-hairline">
        Scroll to enter <strong>{classification}</strong> wing
      </p>
      <Grid {...grid} aria-label="Search Results" className="flex flex-wrap">
        {chunkArray(artworks, gridCols).map((row, rowIndex) => {
          return (
            <GridRow {...grid} key={rowIndex} className="flex min-h-64 my-4">
              {row.map((art) => {
                const {
                  _source: source,
                  _source: { id, title, artist, description },
                } = art

                return (
                  <GridCell
                    {...grid}
                    key={id}
                    as="figure"
                    className="group flex-grow"
                  >
                    <Link href={`/art/${id}`}>
                      <a className="relative">
                        <img
                          src={getImageSrc(source)}
                          className="h-auto w-full p-1"
                          alt={description}
                        />
                        <figcaption className="hidden group-hover:block max-w-full">
                          <h2>{title}</h2>
                          <h3>{artist}</h3>
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

export function chunkArray(items, size = 3) {
  const increaseSizeForFinalChunks = true
  let chunks = [items.splice(0, size)]
  let _size

  while (items.length) {
    const isFinalRowOrTwo = items.length < size * 2
    _size =
      increaseSizeForFinalChunks && isFinalRowOrTwo
        ? Math.max(2, size + 1)
        : size

    chunks.push(items.splice(0, _size))
  }

  return chunks
}

// https://usehooks.com/useWindowSize/
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Call handler right away so state gets updated with initial window size
    handleResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty array ensures that effect is only run on mount

  return windowSize
}
