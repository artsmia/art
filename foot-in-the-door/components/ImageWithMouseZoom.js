/** @format */
import { useState, useEffect, useRef } from 'react'

let hoverInitiated = false

function ImageWithMouseZoom(props) {
  const [hoverRef, isHovered, x, y] = useHover({ requireShift: true })
  const scale = 2

  const { src: initialSrc, style: givenStyle, allowZoom, ...imageProps } = props
  const [, id, initialSize = 800] = initialSrc.match('iiif.dx.artsmia.org') // eslint-disable-line no-unused-vars
    ? initialSrc.match(/(\d+).jpg\/full\/(\d+),/)
    : initialSrc.match(/(\d+).jpg/)
  // choosing size - should take image aspect ratio into account?
  // a portrait image that's 1200px wide has vastly more pixels
  // than a landscape image
  const { width: w, height: h } = imageProps
  const imgAspectRatio = w / h
  const widthForLargeImage =
    imgAspectRatio < 1
      ? 800 // portrait
      : 1200 // landscape
  const zoomedSize = Math.min(imageProps.width, widthForLargeImage)
  const src =
    allowZoom && (isHovered || hoverInitiated) // once hovered, keep the higher res image in place?
      ? `https://iiif.dx.artsmia.org/${id}.jpg/full/${zoomedSize},/0/default.jpg`
      : initialSrc

  // once the higher-res image is loaded, keep it instead of swapping back to the 800px
  useEffect(() => {
    if (isHovered && !hoverInitiated) hoverInitiated = true

    return function cleanup() {
      hoverInitiated = false
    }
  }, [props.src])

  // super magic numbers that mostly seem to work. Think this through
  const delta = -123 * scale
  const [deltaX, deltaY] = [
    (x - 0.5) * delta * imgAspectRatio * 1.3,
    (y - 0.5) * delta * (1 / imgAspectRatio) * 1.3,
  ]
  // scale here doesn't work well if the browser is displaying the imagee
  // at a smaller size than the file that's loaded over the network
  //
  // How to handle that?
  const transform = [
    `scale(${scale})`,
    `translate3d(${deltaX}px, ${deltaY}px, 0`,
  ].join(' ')
  const style =
    allowZoom && isHovered
      ? {
          ...givenStyle,
          transform,
          overflow: 'hidden',
          cursor: 'zoom-in',
          padding: '3em',
        }
      : givenStyle

  const img = (
    <img
      {...imageProps}
      src={src}
      style={style}
      alt={imageProps.alt}
      ref={hoverRef}
    />
  )

  return id && allowZoom ? (
    <a
      href={`https://universalviewer.io/uv.html?manifest=https://iiif.dx.artsmia.org/${id}.jpg/manifest.json`}
      title="Click to open full image in new window"
      target="_blank"
      rel="noreferrer"
    >
      {img}
    </a>
  ) : (
    img
  )
}

export default ImageWithMouseZoom

// modified from https://usehooks.com/useHover/ to handle mouse movement within the hover
function useHover(options = {}) {
  const [value, setValue] = useState(false)
  const [coords, setCoords] = useState([0, 0])

  // Optionally, only trigger 'hover zoom' when the shift key is pressed
  const { requireShift = false } = options
  // IDEA - option to delay 1-2 seconds before flipping `isHovered`?

  const ref = useRef(null)

  function enableZoomMode(event) {
    if (requireShift) {
      if (event.shiftKey) setValue(true)
    } else {
      setValue(true)
    }
  }
  const handleMouseOver = enableZoomMode

  const handleMouseOut = () => setValue(false)
  const handleMouseMove = (event) => {
    if (requireShift) enableZoomMode(event) // wait for the shift key to be pressed and enable the zoom on move along with mouseEnter

    // IDEA - pressing 'escape' should close the zoom?
    // this would require also watching for `keyPress` events, I can't find
    // a way to get escape from `mouseMove`
    // const { metaKey, controlKey, shiftKey, altKey } = event
    //
    // This could go even further - maybe command could increase the zoom level
    // and meta could decrease it? (Or + and - if I hook into keypress events)
    //
    // TODO make this hook accept additional key-based controls as options
    // instead of hardcoding them here?
    if (requireShift && event.altKey) setValue(false)

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
