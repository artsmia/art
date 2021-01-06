/** @format */
import Link from 'next/link'
import { useRouter } from 'next/router'

import { cx, getImageProps, useWindowSize } from '../util'

function LRNav(props) {
  const router = useRouter()
  const { exhibitionId: exhId, exhibitionSlug: exhSlug } = router.query
  const {
    classifications,
    classification,
    children,
    showAllAndStretch,
    imagesForCarousel,
    ...containerProps
  } = props

  const _cls = classifications.map((c) => c.toLowerCase())
  const roomIndex = _cls.indexOf(classification)
  const prevRoom = _cls[(roomIndex - 1) % _cls.length] || 'mixed media' // how does math work again?! wrapping around would be better than `undefined || const`
  const nextRoom = _cls[(roomIndex + 1) % _cls.length]

  const { width } = useWindowSize()
  const showFullNav = showAllAndStretch && width > 768

  const roomLinks = showFullNav
    ? _cls.filter((room) => room !== classification)
    : [prevRoom, nextRoom]

  return (
    <>
      <nav
        {...containerProps}
        className={cx(
          props.className,
          `flex justify-between overflow-x-hidden`,
          showAllAndStretch ? `mx-4` : '',
          showFullNav ? `justify-center` : 'justify-between',
          'w-screen -ml-4 md:-ml-16',
          'pt-12 md:pt-48 -mt-8 md:-mt-24'
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

          const roomSlug = room.replace(/\s/g, '-')

          return (
            <Link
              key={room}
              href={`/exhibitions/${exhId}/${exhSlug}/room/${roomSlug}`}
            >
              <a
                className={cx(
                  'flex px-2 no-underline font-light group',
                  showFullNav && isFirstRoom
                    ? 'pr-4 lg:pr-10 ml-4'
                    : showFullNav && isLastRoom
                    ? 'pl-4 lg:pl-10 mr-4'
                    : '',
                  isFirstRoom || isLastRoom
                    ? 'uppercase hover:underline'
                    : 'capitalize text-gray-300 hover:text-black'
                )}
              >
                {isFirstRoom && (
                  <PeekImages
                    room={room}
                    imagesForCarousel={imagesForCarousel}
                    className="-ml-10 md:-ml-20 left-0 pr-2"
                    showFullNav={showFullNav}
                  />
                )}
                <span dangerouslySetInnerHTML={{ __html: roomText }} />
                {isLastRoom && (
                  <PeekImages
                    room={room}
                    imagesForCarousel={imagesForCarousel}
                    className="-mr-10 md:-mr-24 right-0 pl-2"
                    showFullNav={showFullNav}
                  />
                )}
              </a>
            </Link>
          )
        })}
      </nav>
      {children}
    </>
  )
}

export default LRNav

function PeekImages(props) {
  const { room, imagesForCarousel, className, showFullNav } = props
  if (!imagesForCarousel) return null

  const size = showFullNav ? 3 : 1

  // TODO this is hard. How to expand the idea of a "group" beyond `classification`
  // (which is what FITD uses) so it also works for Todd Webb, which groups based on
  // which artworks are in what part of the exhibition via their exhibition data
  //
  // Solution 1: use two different 'grouping heuristics': one for FITD and one for
  // everything else.
  let artworks = (
    imagesForCarousel.find(([firstItem]) => {
      const groupingHeuristics = [
        firstItem._source.classification.toLowerCase(),
        firstItem.__group?.toLowerCase() ?? null,
      ]

      return groupingHeuristics.indexOf(room) > -1
    }) || []
  ).slice(0, size)

  return (
    <div
      className={cx(
        className,
        showFullNav ? '-mt-48' : '-mt-5 md:-mt-12',
        'opacity-75 group-hover:opacity-100'
      )}
    >
      {artworks.map((art) => (
        <img
          key={art._id}
          {...getImageProps(art._source)}
          alt={art._source.description}
          className="mb-1 w-16 md:w-32 h-auto max-h-64"
        />
      ))}
    </div>
  )
}
