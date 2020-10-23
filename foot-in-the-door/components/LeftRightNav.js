/** @format */
import React from 'react'
import Link from 'next/link'

import { cx, getImageProps, useWindowSize } from '../util'

function LRNav(props) {
  const {
    classifications,
    classification,
    // children,
    showAllAndStretch,
    imagesForCarousel,
    ...containerProps
  } = props

  const _cls = classifications.map((c) => c.toLowerCase())
  const roomIndex = _cls.indexOf(classification)
  const prevRoom = _cls[(roomIndex - 1) % _cls.length] || 'mixed media' // how does math work again?! wrapping around would be better than `undefined || const`
  const nextRoom = _cls[(roomIndex + 1) % _cls.length]

  const { width } = useWindowSize()
  const showFullNav = width > 838

  const roomLinks =
    showFullNav && showAllAndStretch
      ? _cls.filter((room) => room !== classification)
      : [prevRoom, nextRoom]

  return (
    <nav
      {...containerProps}
      className={cx(
        props.className,
        `flex overflow-x-hidden overflow-y-visible w-screen -ml-8 md:-ml-16 mx-4`,
        showFullNav ? `justify-center` : 'justify-between'
      )}
    >
      {roomLinks.map((room, index) => {
        const isFirstRoom = index === 0
        const isLastRoom = index === roomLinks.length - 1

        const roomText = isFirstRoom
          ? `&lsaquo; ${room}`
          : isLastRoom
          ? `${room} &rsaquo;`
          : room

        const link = (
          <Link href={`/room/${room.replace(' ', '-')}`}>
            <a
              dangerouslySetInnerHTML={{ __html: roomText }}
              className={cx(
                'uppercase px-1',
                showFullNav && isFirstRoom
                  ? 'pr-10 ml-4'
                  : showFullNav && isLastRoom
                  ? 'pl-10 mr-4'
                  : ''
              )}
            />
          </Link>
        )

        return (
          <React.Fragment key={room}>
            {isFirstRoom && (
              <PeekImages
                room={room}
                imagesForCarousel={imagesForCarousel}
                className="-ml-20 left-0"
                showFullNav={showFullNav}
              />
            )}
            {link}
            {isLastRoom && (
              <PeekImages
                room={room}
                imagesForCarousel={imagesForCarousel}
                className="-mr-20 right-0"
                showFullNav={showFullNav}
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default LRNav

function PeekImages(props) {
  const { room, imagesForCarousel, className, showFullNav } = props
  if (!imagesForCarousel) return null

  const size = showFullNav ? 3 : 1

  let artworks = (
    imagesForCarousel.find(
      (arr) => arr[0]._source.classification.toLowerCase() === room
    ) || []
  ).slice(0, size)

  return (
    <Link href={`/room/${room.replace(' ', '-')}`}>
      <a
        className={cx(
          className,
          'h-screen overflow-y-visible overflow-x-hidden',
          showFullNav ? 'absolute -mt-32' : '-mt-12'
        )}
      >
        {artworks.map((art) => (
          <img
            key={art._id}
            {...getImageProps(art._source)}
            alt={art._source.description}
            className="mb-1 w-32 h-auto"
          />
        ))}
      </a>
    </Link>
  )
}
