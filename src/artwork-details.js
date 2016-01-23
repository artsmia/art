var React = require('react')
var capitalize = require('capitalize')
var Isvg = require('react-inlinesvg')

var Markdown = require('./markdown')

var ArtworkDetails = React.createClass({
  build(field, fn) {
    var {art, highlights} = this.props
    var humanFieldName = capitalize.words(field).replace('_', ' ')
    var value = highlights ?
      highlights[field] :
      art[field]
    if(!value || value == '') return

    if(highlights && highlights[field]) value = <Markdown>{value[0]}</Markdown>

    // merge `art` with `highlights`, replacing the un-highlighted values with
    // their 'highlit' equivalent
    var artAndHighlights = !highlights ? art : Object.assign({...art}, Object.keys(highlights).reduce((object, key) => {
      var value = highlights[key] && highlights[key][0]
      if(typeof value == 'string') value = <Markdown>{value}</Markdown>
      object[key] = value
      return object
    }, {}))

    var content = fn ? fn(artAndHighlights, art) : artAndHighlights[field]

    return <div className="detail-row">
      <div className="detail-title">{humanFieldName}</div>
      <div className='detail-content'>{content}</div>
    </div>
  },

  render() {
    var {art, highlights} = this.props
    var skip = this.props.skipFields ? this.props.skipFields.split(' ') : []
    var details = [
      ['title'],
      ['dated'],
      ['artist'],
      ['nationality'],
      ['role'],
      ['gallery', art => art.room],
      ['department'],
      ['dimension', (art, rawArt) => art.dimension && <div>
        {art.dimension}
        {rawArt.dimension.match(/x.*cm/) && <Isvg src={`http://localhost:4009/svgs/${art.id}/dimension.svg`} />}
      </div>],
      ['credit', art => art.creditline],
      ['accession_number'],
      ['medium'],
      ['country'],
      ['culture'],
      ['century', art => art.style],
      ['provenance'],
      ['rights', art => {
        return <div>
          <span>{decodeURIComponent(art.image_copyright)}</span>
          {art.image_copyright && art.image_rights_type && <br/>}
          {art.image_rights_type && <span>{art.image_rights_type}</span>}
        </div>
      }],
      ['marks'],
    ]
    if(highlights && highlights.description) details.push(['description'])
    details = details.filter(([field]) => skip.indexOf(field) < 0)
    .map(field => this.build(...field))
    .filter(detail => !!detail)

    return <div className='artwork-detail'>
      {details}
    </div>
  },
})

module.exports = ArtworkDetails
