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
    ...wrapperProps
  } = props

  const Wrapper = WrapperElem || 'div'

  const bgImageStyle = imageProps?.valid
    ? { '--bg-image': `url(${imageSrc})` }
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
