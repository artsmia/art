/** @format */
import { useState } from 'react'

function Image(props) {
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
    />
  ) : (
    <span {...imageProps} style={errorStyle} className="sticky top-2">
      {errorMessage || title}
    </span>
  )
}

export default Image
