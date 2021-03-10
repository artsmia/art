/** @format */
import { Fragment } from 'react'

import Link from 'components/NestedLink'
import ImageWithBackground from 'components/ImageWithBackground'
import LikeControl from 'components/LikeControl'
import Text from 'components/Text'
import { cx, getImageProps, segmentTitle } from 'util/index'

function ArtworkSideBySide(props) {
  const {
    artwork,
    artwork: {
      title: rawTitle,
      artist: rawArtist,
      medium,
      dated,
      description,
      keywords: keywordsString,
      // dimension,
      image_width,
      image_height,
    },
    isFitD,
  } = props

  const artist = rawArtist.replace('Artist: ', '')
  const title = segmentTitle(rawTitle)

  const keywords =
    keywordsString &&
    (keywordsString?.replace(/\s\s+/, ' ').indexOf(',') > -1
      ? keywordsString.split(/,\s?/g)
      : keywordsString.split(' ')
    ).filter((word) => !word.match(/^\s+$/))

  const aspectRatio = image_width / image_height
  const isPortrait = isFitD ? aspectRatio <= 1 : true // treat all Mia exhibition artworks as 'portrait'
  const leftWidth = isPortrait ? '1/2' : '2/3'
  const rightWidth = isPortrait ? '1/2' : '1/3'
  const imgMaxHeight = isPortrait ? '97vh' : 'auto'
  // const imgMaxWidth = isPortrait ? `${90 * aspectRatio}vh` : '100%'
  const { src: imageSrc, ...imageProps } = getImageProps(artwork, {
    fullSize: true,
  })

  return (
    <main className="md:flex md:align-start off:min-h-screen-3/5 pt-2">
      <ImageWithBackground
        imageSrc={imageSrc}
        className={cx(
          `relative md:w-${leftWidth}`,
          'object-contain object-center max-h-full md:mr-4'
        )}
      >
        {imageProps.valid ? (
          <img
            {...imageProps}
            src={imageSrc}
            alt={description}
            key={artwork.id}
            className="sticky top-2"
            style={{
              ...imageProps.style,
              top: '1.5vh',
              maxHeight: imgMaxHeight,
              width: 'auto',
              margin: '0 auto',
            }}
          />
        ) : (
          <span {...imageProps} className="sticky top-2">
            No Image Available
          </span>
        )}
        {isFitD && <LikeControl artwork={artwork} showConfirmation={true} />}
      </ImageWithBackground>
      <div
        className={`flex flex-col justify-start border-t-2 border-black md:w-${rightWidth} md:ml-2 sticky top-2`}
      >
        <div className="font-light">
          <h1 className="text-2xl font-light capitalize">
            {title},{' '}
            <span className="text-base text-2xl font-light">{dated}</span>
          </h1>
          <h2 className="text-lg font-bold">{artist}</h2>
          <p>{medium}</p>
          <p className="text-sm uppercase">
            {artwork.creditline}{' '}
            <span className="ml-4">{artwork.accession_number}</span>
          </p>
          <p className="bg-pink-300 hidden">COLOR SEARCH</p>
          <p className="py-4 hidden">{description}</p>
          {keywordsString && (
            <p className="whitespace-normal break-word overflow-scroll">
              <strong>Keywords</strong>:{' '}
              {keywords.map((word, index) => (
                <Fragment key={word}>
                  <Link href={`/search/keywords:${word}`} key={word}>
                    <a className="pl-1">{word}</a>
                  </Link>
                  {index === keywords.length - 1 ? '' : ','}{' '}
                </Fragment>
              ))}
            </p>
          )}
          <Text>{artwork?.text}</Text>
        </div>

        <div className="border-t-2 border-opacity-75 mt-8 lg:mt-16">
          {isFitD || (
            <>
              <p>
                Image: {artwork.rights_type}. {artwork.creditline}
              </p>
            </>
          )}
          {props.children}
        </div>
      </div>
    </main>
  )
}

export default ArtworkSideBySide
