/** @format */

import { cx } from '../util'
import styles from './ImageWithBackground.module.css'

function ImageWithBackground(props) {
  const {
    imageSrc,
    imageProps,
    children,
    as: WrapperElem,
    className,
    style,
    opacity,
    ...wrapperProps
  } = props

  const Wrapper = WrapperElem || 'div'

  const bgImageStyle = imageProps?.valid
    ? { '--bg-image': `url(${imageSrc})`, '--bg-opacity': opacity || '.35' }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cx(className, styles.imageBlurBackground, 'relative')}
      style={{ ...style, ...bgImageStyle }}
    >
      {children}
    </Wrapper>
  )
}

export default ImageWithBackground
