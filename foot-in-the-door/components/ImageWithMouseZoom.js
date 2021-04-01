/** @format */
import { useState, useEffect, useRef } from 'react'

let hoverInitiated = false

function ImageWithMouseZoom(props) {
  const [scale, setScale] = useState(2)
  const [hoverRef, isHovered, zoomActive, x, y] = useHover({
    requireShift: true,
    controls: {
      option: () => setScale(2),
      command: () => setScale(5),
      //     setScale(Math.floor(scale+1))
      // TODO incremental increases in scale don't work, because the function closes over
      // the initial value of scale and doesn't re-evaluate with later state changes.
      // Learn react or something! For now, just have two zoom levels
    },
  })

  useEffect(() => {
    if (props.setHideInfo) props.setHideInfo(zoomActive && scale > 2)
  }, [scale])

  const { src: initialSrc, style: givenStyle, allowZoom, ...imageProps } = props
  const [, id, initialSize = 800] = initialSrc.match('iiif.dx.artsmia.org') // eslint-disable-line no-unused-vars
    ? initialSrc.match(/(\d+).jpg\/full\/(\d+),/)
    : initialSrc.match(/(\d+).jpg/)
  // choosing size - should take image aspect ratio into account?
  // a portrait image that's 1200px wide has vastly more pixels
  // than a landscape image
  const { width: w, height: h } = imageProps
  const imgAspectRatio = w / h
  // prettier-ignore
  const widthForLargeImage =
    imgAspectRatio < 1
      ? scale <= 2 ? 800 : 1200 // portrait
      : scale <= 2 ? 1200 : 1500 // landscape
  const zoomedSize = Math.min(imageProps.width, widthForLargeImage)
  const src =
    allowZoom && (zoomActive || hoverInitiated) // once hovered, keep the higher res image in place?
      ? `https://iiif.dx.artsmia.org/${id}.jpg/full/${zoomedSize},/0/default.jpg`
      : initialSrc

  // once the higher-res image is loaded, keep it instead of swapping back to the 800px
  useEffect(() => {
    if (zoomActive && !hoverInitiated) hoverInitiated = true

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
  const style = {
    ...givenStyle,
    ...(allowZoom && zoomActive
      ? {
          transform,
          overflow: 'hidden',
          padding: '3em',
        }
      : {}),
    ...(allowZoom && isHovered
      ? {
          cursor: 'zoom-in',
        }
      : {}),
  }

  const img = (
    <img
      {...imageProps}
      src={src}
      style={style}
      alt={imageProps.alt}
      ref={hoverRef}
    />
  )

  const zoomInstructions = `Click to open full image in new window.
To zoom the image in place, move your mouse while pressing shift on your keyboard.

Increase the size by pressing the command key, or decrease it with option.
Close the zoom by moving your mouse out of the image area or pressing control.`

  if (props.instructionsElem) {
    const [preZoomInstr, zoomActiveInstr] = zoomInstructions.split('\n\n')
    if (zoomActive) {
      props.instructionsElem.innerText = zoomActiveInstr
    } else {
      props.instructionsElem.innerText = isHovered
        ? preZoomInstr
        : '(Hover over image on the left to zoom)'
    }
  }
  // IDEA - set a cookie to hide these instructions once a visitor learns them?
  // And we would know they've learned them once they use each control a few times?

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
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [coords, setCoords] = useState([0, 0])

  // Optionally, only trigger 'hover zoom' when the shift key is pressed
  const { requireShift = false, controls } = options
  // IDEA - option to delay 1-2 seconds before flipping `isHovered`?

  const ref = useRef(null)

  function enableZoomMode(event) {
    setIsHovered(true)
    if (requireShift) {
      if (event.shiftKey) setIsActive(true)
    } else {
      setIsActive(true)
    }
  }
  const handleMouseOver = enableZoomMode

  const handleMouseOut = () => {
    setIsHovered(false)
    setIsActive(false)
  }
  const handleMouseMove = (event) => {
    if (requireShift) enableZoomMode(event) // wait for the shift key to be pressed and enable the zoom on move along with mouseEnter

    // IDEA - pressing 'escape' should close the zoom?
    // this would require also watching for `keyPress` events, I can't find
    // a way to get escape from `mouseMove`. For now, control cancels the zoom
    //
    // TODO make this hook accept additional key-based controls as options
    // instead of hardcoding them here?
    const { metaKey, ctrlKey, altKey } = event // metaKey (command); ctrlKey; altKey (option); shiftKey

    if (requireShift && ctrlKey) handleMouseOut()

    // Command increases the zoom, option decreases it
    // (This could be + and - if I can hook into keypress events?)
    const { option: onOptionPress, command: onCommandPress } = controls || {}
    if (metaKey && onCommandPress) onCommandPress()
    if (altKey && onOptionPress) onOptionPress()

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

  return [ref, isHovered, isActive, ...coords]
}
