/** @format */
import { useState, useEffect, useRef } from 'react'

function ImageWithMouseZoom(props) {
  const [hoverRef, isHovered, x, y] = useHover()
  const scale = 1.5

  const { src: initialSrc, style: givenStyle, ...imageProps } = props
  const [, id, initialSize = 800] = initialSrc.match('iiif.dx.artsmia.org') 
    ? initialSrc.match(/(\d+).jpg\/full\/(\d+),/)
    : initialSrc.match(/(\d+).jpg/)
  const zoomedSize = Math.round(initialSize * scale)
  const src = isHovered
    ? `https://iiif.dx.artsmia.org/${id}.jpg/full/${zoomedSize},/0/default.jpg`
    : initialSrc

  // delta here should have something to do with image aspect
  // ratio I think?
  const delta = -234
  const transform = [
    `scale(${scale})`,
    `translate3d(${(x - 0.5) * delta}px, ${(y - 0.5) * delta}px, 0`,
  ].join(' ')
  const style = isHovered
    ? { ...givenStyle, transform, overflow: 'hidden', cursor: 'zoom-in' }
    : givenStyle

  return (
    <img
      {...imageProps}
      src={src}
      style={style}
      alt={imageProps.alt}
      ref={hoverRef}
    />
  )
}

export default ImageWithMouseZoom

// modified from https://usehooks.com/useHover/ to handle mouse movement within the hover
function useHover() {
  const [value, setValue] = useState(false)
  const [coords, setCoords] = useState([0, 0])

  const ref = useRef(null)

  const handleMouseOver = () => setValue(true)
  const handleMouseOut = () => setValue(false)
  const handleMouseMove = (event) => {
    setCoords([
      event.layerX / event.target.clientWidth,
      event.layerY / event.target.clientHeight,
    ])
  }

  useEffect(
    () => {
      const node = ref.current
      if (node) {
        node.addEventListener('mouseover', handleMouseOver)
        node.addEventListener('mouseout', handleMouseOut)
        node.addEventListener('mousemove', handleMouseMove)

        return () => {
          node.removeEventListener('mouseover', handleMouseOver)
          node.removeEventListener('mouseout', handleMouseOut)
          node.removeEventListener('mousemove', handleMouseMove)
        }
      }
    },
    [ref.current] // Recall only if ref changes
  )

  return [ref, value, ...coords]
}
