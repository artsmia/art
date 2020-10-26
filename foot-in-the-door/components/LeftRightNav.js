/** @format */
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
  const showFullNav = showAllAndStretch && width > 838

  const roomLinks = showFullNav
    ? _cls.filter((room) => room !== classification)
    : [prevRoom, nextRoom]

  return (
    <nav
      {...containerProps}
      className={cx(
        props.className,
        `flex `,
        showAllAndStretch
          ? `overflow-x-hidden overflow-y-visible w-screen -ml-4 md:-ml-16 mx-4`
          : '',
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

        return (
          <Link key={room} href={`/room/${room.replace(' ', '-')}`}>
            <a
              className={cx(
                'capitalize px-1 no-underline font-light',
                showFullNav && isFirstRoom
                  ? 'pr-10 ml-4'
                  : showFullNav && isLastRoom
                  ? 'pl-10 mr-4'
                  : '',
                showFullNav || 'flex'
              )}
            >
              {isFirstRoom && (
                <PeekImages
                  room={room}
                  imagesForCarousel={imagesForCarousel}
                  className="-ml-20 left-0"
                  showFullNav={showFullNav}
                />
              )}
              <span dangerouslySetInnerHTML={{ __html: roomText }} />
              {isLastRoom && (
                <PeekImages
                  room={room}
                  imagesForCarousel={imagesForCarousel}
                  className="-mr-24 right-0"
                  showFullNav={showFullNav}
                />
              )}
            </a>
          </Link>
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
    <div
      className={cx(
        className,
        showFullNav ? 'h-screen overflow-y-visible overflow-x-hidden' : '',
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
    </div>
  )
}
