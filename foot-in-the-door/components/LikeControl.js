/** @format */
import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { HiHeart, HiOutlineHeart } from '@meronex/icons/hi'
import { cx, getUserLikes, likeArtwork } from '../util'

function LikeControl(props) {
  const { artwork, showConfirmation, className, hydrateLocal } = props
  const [artworkLiked, setArtworkLiked] = useState(false)
  useEffect(() => {
    // only do this check on proper artwork pages
    // doing it for every artwork in the grid would be way too many network
    // requests. use global state?
    if (!hydrateLocal && !showConfirmation) return
    async function getLikesAndCheckIfThisIsLiked() {
      const existingLikes = await getUserLikes({
        idsOnly: true,
        localOnly: hydrateLocal,
      })

      setArtworkLiked(existingLikes.indexOf(artwork.id) >= 0)
    }

    getLikesAndCheckIfThisIsLiked()
  }, [artwork])

  const heartProps = {
    className:
      'text-white transform rounded hover:scale-125 bg-black bg-opacity-25',
    size: '1.5rem',
  }
  const heartComponent = artworkLiked ? (
    <HiHeart {...heartProps} />
  ) : (
    <HiOutlineHeart {...heartProps} />
  )
  function _likeArtwork(event) {
    likeArtwork(artwork.id)
    setArtworkLiked(true)
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      <span
        className={cx('absolute bottom-0 right-0 p-2 pr-4', className)}
        onClick={_likeArtwork}
        onKeyPress={_likeArtwork}
        role="button"
        tabIndex={0}
        title="Save this artwork"
      >
        {heartComponent}
      </span>
      {artworkLiked && showConfirmation && (
        <Link href="/favorites">
          <a className="absolute bottom-0 left-0 px-2 text-white bg-black">
            View your list of favorite artworks
          </a>
        </Link>
      )}
    </>
  )
}

export default LikeControl
