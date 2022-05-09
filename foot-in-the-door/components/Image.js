/** @format */
import { useState, forwardRef } from 'react'

function Image(props, ref) {
  const {
    valid: imageIsValid,
    title,
    errorMessage,
    errorStyle,
    ...imageProps
  } = props
  const [imageStatus, setImageStatus] = useState('loading')
  const imageFailed = imageStatus === 'error'

  /* eslint-disable no-unused-vars */
  function onImageLoadError(e) {
    setImageStatus('error')
  }

  return imageIsValid && !imageFailed ? (
    <img
      {...imageProps}
      alt={props.alt}
      onLoad={() => setImageStatus('loaded')}
      onError={onImageLoadError}
      ref={ref}
    />
  ) : (
    <span {...imageProps} style={errorStyle} className="sticky top-2">
      {errorMessage || title}
    </span>
  )
}

export default forwardRef(Image)
