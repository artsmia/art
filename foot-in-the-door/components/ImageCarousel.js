/** @format */
import Link from 'next/link'

import styles from './ImageCarousel.module.css'
import { getImageProps } from '../util'

function ImageCarousel(props) {
  const isCollapsed = props.isCollapsed || true
  const data = props.data

  const loading = (
    <Link href="/room/ceramics">
      <div className="bg-gray-100 w-100 md:w-1/2 p-4 m-4">
        {isCollapsed ? 'small' : 'big'} Image carousel goes here
      </div>
    </Link>
  )

  return !data ? (
    loading
  ) : (
    <ul className={styles.imageCarousel}>
      {data.map((art, carouselIndex) => {
        const { classification: cl } = art
        const classif = cl.replace(' (including Digital)', '')
        return (
          <li key={art.id} className="p-1 w-48 focus:w-auto flex-shrink-0">
            <Link href={`/room/${classif.toLowerCase()}`}>
              <a className="no-underline">
                <div className="group relative mx-1">
                  <img
                    {...getImageProps(art)}
                    alt={art.description}
                    loading={carouselIndex > 3 && 'lazy'}
                    className="border-black border-b-4 h-64 md:h-96 w-auto self-stretch object-cover"
                  />
                  <div className="flex absolute inset-0 items-end">
                    <p className="hidden group-hover:inline text-white px-4 py-2 bg-black w-full uppercase opacity-100 text-xs font-light">
                      View Room &rsaquo;
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
  )
}

export default ImageCarousel
