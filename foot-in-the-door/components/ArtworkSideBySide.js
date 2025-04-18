/** @format */
import { Fragment, useState, useRef } from 'react'

import Link from 'components/NestedLink'
import ImageWithBackground from 'components/ImageWithBackground'
import LikeControl from 'components/LikeControl'
import Text from 'components/Text'
import { cx, getImageProps, segmentTitle } from 'util/index'
import ImageWithMouseZoom from 'components/ImageWithMouseZoom'

function ArtworkSideBySide(props) {
  let {
    artwork,
    artwork: {
      description,
      keywords: keywordsString,
      // dimension,
      image_width,
      image_height,
    },
    isFitD,
  } = props

  const zoomInstructionsRef = useRef(null)
  const [hideInfo, setHideInfo] = useState(false)

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
  const { src: imageSrc, style: imageStyle, ...imageProps } = getImageProps(
    artwork,
    {
      fullSize: true,
    }
  )

  const {
    dataPrefix,
    showAuxilaryImage,
    auxilaryImagePrompt,
    favoriteLanguage,
  } = props.exhibitionData || {}
  const referenceArtworkImageProps = showAuxilaryImage
    ? getImageProps(props.referenceArtwork, {
        fullSize: true,
      })
    : {}

  return (
    <main className="md:flex md:align-start off:min-h-screen-3/5 pt-2">
      <ImageWithBackground
        imageSrc={imageSrc}
        imageProps={imageProps}
        className={cx(
          `relative md:w-${leftWidth}`,
          'object-contain object-center max-h-full md:mr-4'
        )}
        opacity={'.05'}
      >
        <div className="sticky top-2" style={{ top: '1.5vh' }}>
          <ImageWithMouseZoom
            {...imageProps}
            src={imageSrc}
            alt={description}
            key={artwork.id}
            style={{
              ...imageStyle,
              top: '1.5vh',
              maxHeight: imgMaxHeight,
              width: 'auto',
              margin: '0 auto',
              zIndex: '10',
            }}
            instructionsElem={zoomInstructionsRef.current}
            setHideInfo={setHideInfo}
          />
          {dataPrefix === 'aib21' && (
            <LikeControl
              artwork={artwork}
              showConfirmation={true}
              dataPrefix={dataPrefix}
              favoriteLanguage={favoriteLanguage}
            />
          )}
        </div>
      </ImageWithBackground>
      <div
        className={`flex flex-col justify-start border-t-2 border-black md:w-${rightWidth} md:pl-2`}
        style={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.5)',
          zIndex: '11',
          visibility: hideInfo ? 'hidden' : 'visible',
        }}
      >
        <div className="font-light py-0">
          <Tombstone
            artwork={artwork}
            exhibitionData={props.exhibitionData}
            hideAccessionNumber={dataPrefix === 'aib21'}
          />

          {keywordsString && (
            <p className="">
              <strong>
                {props.exhibitionData.keywordsPrompt || 'Keywords'}
              </strong>
              :{' '}
              {keywords.map((word, index) => (
                <Fragment key={word}>
                  <Link href={`/search/keywords:${word}`} key={word}>
                    <a className="pl-1 hover:underline">{word}</a>
                  </Link>
                  {index === keywords.length - 1 ? '' : ','}{' '}
                </Fragment>
              ))}
            </p>
          )}
          <Text dangerous={true}>{artwork?.text}</Text>
        </div>

        <div className="border-t-2 border-opacity-75 mt-8 lg:mt-16">
          {isFitD || !!dataPrefix || (
            <>
              <p>
                Image: {artwork.rights_type}. {artwork.creditline}
              </p>

              <p ref={zoomInstructionsRef} className="pt-4"></p>
            </>
          )}
          {props.children}
        </div>

        {showAuxilaryImage && props.referenceArtwork && (
          <div
            className="mt-12 pt-2 min-h-full md:min-h-screen-3x"
            id="partner-container"
          >
            <>
              {auxilaryImagePrompt && (
                <p className="font-bold text-lg pb-2">{auxilaryImagePrompt}</p>
              )}
              <ImageWithBackground
                imageSrc={referenceArtworkImageProps.src}
                imageProps={referenceArtworkImageProps}
                className={cx(
                  'object-contain object-center max-h-full md:mr-4',
                  'sticky'
                )}
                style={{ top: '1.5vh' }}
                opacity={'0'}
                id="partner"
              >
                <ImageWithMouseZoom
                  {...referenceArtworkImageProps}
                  src={referenceArtworkImageProps.src}
                  key={artwork.id}
                  style={{
                    maxHeight: '91vh',
                    width: 'auto',
                    position: 'relative',
                  }}
                  className="group"
                >
                  <img
                    src={imageSrc}
                    alt=""
                    className="absolute top-0 right-0 group-hover:hidden md:hidden"
                    style={{ width: '33%' }}
                  />
                </ImageWithMouseZoom>
                <div className="pt-2 py-4">
                  <Tombstone artwork={props.referenceArtwork} />
                  {/* eslint-disable react/jsx-no-target-blank */}
                  {false && (
                    <p className="text-lg pb-2">
                      Floral Arrangement by {artwork.artist}
                    </p>
                  )}
                  <a
                    href={`https://collections.artsmia.org/art/${artwork.id}`}
                    target="_blank"
                    className="hover:underline font-bold"
                  >
                    View full artwork info &rarr;
                  </a>
                </div>
              </ImageWithBackground>
            </>
          </div>
        )}
      </div>
    </main>
  )
}

export default ArtworkSideBySide

function ArtworkGalleryLocation(props) {
  const { art, ...wrapperProps } = props
  const onViewPhrase = art.room?.match(/G/)
    ? `On View in Gallery ${art.room.replace('G', '')}`
    : art.room

  return <p {...wrapperProps}>{onViewPhrase}</p>
}

function Tombstone(props) {
  let {
    artwork,
    artwork: {
      title: rawTitle,
      artist: rawArtist,
      dated,
      medium,
      creditline,
      accession_number,
      culture,
      country,
    },
    exhibitionData = {},
  } = props
  const { segmentArtTitles = true } = exhibitionData

  const artist = rawArtist?.replace('Artist: ', '')
  const title = segmentArtTitles ? segmentTitle(rawTitle) : rawTitle

  const artistCreator = artist !== '' ? artist : culture || country

  return (
    <>
      <h1
        className={cx(
          'text-2xl capitalize',
          segmentArtTitles ? 'font-light' : 'font-black'
        )}
      >
        {title}, <span className="text-base text-2xl font-light">{dated}</span>
      </h1>
      <h2 className="text-lg pt-0">{artistCreator}</h2>
      <p>{medium}</p>
      <p className="text-xs uppercase pt-1">
        {creditline}{' '}
        {props.hideAccessionNumber ? null : (
          <span className="ml-4">{accession_number}</span>
        )}
      </p>
      <ArtworkGalleryLocation art={artwork} className="font-bold pt-1 pb-4" />
    </>
  )
}
