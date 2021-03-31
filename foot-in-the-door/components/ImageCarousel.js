/** @format */
import { useState, useEffect, useRef } from 'react'
import Link from 'components/NestedLink'

import styles from './ImageCarousel.module.css'
import { cx, getImageProps } from '../util'
import ImageWithBackground from 'components/ImageWithBackground'

function ImageCarousel(props) {
  const [carouselIndex, setCarouselIndex] = useState(0)
  const isCollapsed = props.isCollapsed || true
  const { className, data, exhibitionData } = props
  const containOnHover =
    props.containOnHover || exhibitionData?.imageCarousel?.containOnHover

  const observerRef = useRef()
  const carouselRef = useRef()

  // why won't #map work here? React complains about hooks being called inconsistently
  const itemRefs = data.reduce((refs) => refs.concat(useRef()), [])

  useEffect(() => {
    if (!carouselRef?.current) return
    function ioCallback(entries) {
      // entries have scrolled into- or out of- the container's bounds.
      // find the container that just scrolled off, and re-set the index
      // to the item next to that?
      const scrolledPastEvent = entries.find((e) => e.intersectionRect.x <= 0)

      if (scrolledPastEvent) {
        // const scrolledPastIndex = itemRefs.findIndex(
        //   (ref) => ref.current === scrolledPastEvent.target
        // )
        // Determine the direction of the current scroll based on `boundingClientRect`.
        // If the rectancle in on the right side of the screeen (`x` > some threshold),
        // the items are being scrolled to the left and visa verse.
        // const direction = scrolledPastEvent.boundingClientRect.x < 500 ? 1 : -2
        // setCarouselIndex(scrolledPastIndex + direction)
      }
    }

    const observer = new IntersectionObserver(ioCallback, {
      root: carouselRef.current,
      threshold: 0,
    })
    observerRef.current = observer

    itemRefs.map((ref) => observer.observe(ref.current))

    return () => observer.disconnect()
  }, [carouselRef])

  function scrollToItem(index) {
    // somehow disable intersection observer when scrolling manually?
    // observerRef.current
    const scrollToEl = carouselRef.current.querySelectorAll(`li`)[index]
    scrollToEl?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
    setCarouselIndex(index)
  }
  useEffect(() => {
    scrollToItem(carouselIndex)
  }, [carouselIndex])

  const {
    exhibition_id: exhId = 2760,
    exhibition_title: exhTitle,
    firstRoom = 'ceramics',
  } = exhibitionData || {}
  const exhSlug =
    exhTitle?.split(':')[0].replace(/\s/g, '-').toLowerCase() ??
    'foot-in-the-door'

  const loading = (
    <Link href={`/exhibitions/${exhId}/${exhSlug}/room/${firstRoom}`}>
      <div className="bg-gray-100 w-100 md:w-1/2 p-4 m-4">
        {isCollapsed ? 'small' : 'big'} Image carousel goes here
      </div>
    </Link>
  )

  return !data ? (
    loading
  ) : (
    <div className={cx(styles.imageCarousel, className)}>
      <ul ref={carouselRef}>
        {data.map((art, index) => {
          const { classification: cl, __artDirectionStyle } = art
          const classif = cl.replace(' (including Digital)', '')
          const imageProps = getImageProps(art, { fullSize: true })
          return (
            <li
              key={art.id}
              className="p-1 w-48 focus:w-auto flex-shrink-0"
              ref={itemRefs[index]}
            >
              <Link
                href={`/exhibitions/${exhId}/${exhSlug}/room/${classif
                  .toLowerCase()
                  .replace(/\s/g, '-')}`}
              >
                <a className="no-underline">
                  <div className="group relative mx-1 overflow-hidden">
                    <ImageWithBackground imageSrc={imageProps.src}>
                      <img
                        {...imageProps}
                        alt={art.description}
                        loading={index > 3 ? 'lazy' : undefined}
                        className={cx(
                          'border-black border-b-4 h-64 md:h-96 w-full self-stretch object-cover',
                          __artDirectionStyle,
                          containOnHover ? 'group-hover:object-contain' : ''
                        )}
                      />
                    </ImageWithBackground>
                    <div className="flex absolute inset-0 items-end">
                      <p className="hidden group-hover:inline text-white px-4 py-2 bg-black w-full uppercase opacity-100 text-xs font-light">
                        View Section &rsaquo;
                      </p>
                    </div>
                  </div>
                  <strong className="font-black text-2xl">{classif}</strong>
                </a>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="flex flex-wrap justify-between">
        <div className="flex">
          {data.map((art, index) => {
            if (index % 2 === 0) return null
            const currentIndex = index === carouselIndex
            return (
              <span
                className={cx(
                  currentIndex ? 'bg-black w-12' : 'bg-gray-200',
                  'block w-8 h-3 mr-2 mb-2 hover:bg-gray-400'
                )}
                key={index}
                onClick={() => scrollToItem(index)}
                onKeyPress={() => scrollToItem(index)}
                role="button"
                tabIndex="0"
                title={`Scroll to ${art.classification}`}
              ></span>
            )
          })}
        </div>
        <Link href="/exhibitions/2760/foot-in-the-door/room/all">
          <a className="uppercase border mr-8 px-2 p-1 font-bold no-underline hover:underline text-sm">
            View All
          </a>
        </Link>
      </p>
    </div>
  )
}

export default ImageCarousel
