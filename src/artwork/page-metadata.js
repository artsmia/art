var React = require('react')
var Helmet = require('react-helmet')

var _Artwork = require('../_artwork')
var imageCDN = require('../image-cdn')

module.exports = ({art, noIndex, prependTitle}) => {
  var pageTitle =
    (prependTitle || '') +
    [
      art.title.replace(/<[^ ]+?>/g, '"'), // title scrubbed of errant HTML
      _Artwork.Creator.getFacetAndValue(art)[1],
    ].filter(e => e).join(', ')

  var imageUrl = imageCDN(art.id)
  var canonicalURL = `http://collections.artsmia.org/art/${art.id}/${art.slug}`

  return (
    <Helmet
      title={pageTitle}
      meta={[
        {
          property: 'og:title',
          content: pageTitle + ' ^ Minneapolis Institute of Art',
        },
        { property: 'og:description', content: art.text },
        { property: 'og:image', content: imageUrl },
        { property: 'og:url', content: canonicalURL },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:site', content: '@artsmia' },
        {
          property: 'robots',
          content: noIndex ? 'noindex, nofollow' : 'all',
        },
        {
          property: 'googlebot',
          content: noIndex ? 'noindex, nofollow' : 'all',
        },
      ]}
      link={[
        { rel: 'canonical', href: canonicalURL },
        { rel: 'prefetch', href: `https://search.artsmia.org/id/${art.id}` },
        { rel: 'prefetch', href: `https://iiif.dx.artsmia.org/${art.id}.jpg/info.json` },
      ]}
    />
  )
}
