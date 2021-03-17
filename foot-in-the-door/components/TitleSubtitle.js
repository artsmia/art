/** @format */
import { segmentTitle, cx } from 'util/index'

function TitleSubtitle(props) {
  const { title: rawTitle, useSegmentation, headerStyles } = props

  const [, title, ...subtitles] = useSegmentation
    ? segmentTitle(rawTitle, { returnJSX: false })
    : [
        undefined,
        <span className="font-black" key="title">
          {rawTitle}
        </span>,
        undefined,
      ]
  const subtitle = subtitles.join('').trim().replace(/^[|:]/, '')

  return (
    <>
      <h1
        className={cx(
          'text-5xl font-black capitalize tracking-wide leading-snug',
          headerStyles,
          subtitle || 'pb-4'
        )}
      >
        {title}
      </h1>
      {subtitle && (
        <h2
          className={cx(
            'text-3xl sm:text-4xl lg:text-5xl font-light pb-4',
            headerStyles
          )}
        >
          {subtitle}
        </h2>
      )}
    </>
  )
}

export default TitleSubtitle
