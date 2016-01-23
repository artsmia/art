var React = require('react')
var capitalize = require('capitalize')
var Isvg = require('react-inlinesvg')
var cx = require('classnames')

var Markdown = require('./markdown')
var Peek = require('./peek')
var dimensionSvg = require('./endpoints').dimensionSvg

var ArtworkDetails = React.createClass({
  build(field, fn) {
    var {art, highlights} = this.props
    if(this.props.onlyShowHighlightDetails && !highlights[field]) return

    var humanFieldName = capitalize.words(field).replace('_', ' ')
    var artAndHighlights = this.artAndHighlights()
    var [content, extraContent] = fn ? fn(artAndHighlights, art) : [artAndHighlights[field]]
    if(!content || content == '') return
    var showExtra = extraContent && this.state.expandDetailsMatrix[field]
    var classes = cx("detail-row", {expandable: extraContent})

    return <div className={classes} onClick={this.toggleExtra.bind(this, field)}>
      <dt className="detail-title">{humanFieldName}</dt>
      <dd className='detail-content'>{content}</dd>
      {showExtra && <div className="detail-extra">{extraContent}</div>}
    </div>
  },

  toggleExtra(field) {
    var {expandDetailsMatrix} = this.state
    expandDetailsMatrix[field] = !expandDetailsMatrix[field]
    this.setState({expandDetailsMatrix})
  },

  // merge `art` with `highlights`, replacing the un-highlighted values with
  // their 'highlit' equivalent
  artAndHighlights() {
    var {art, highlights} = this.props

    this.merged = this.merged || !highlights ? art : Object.assign({...art}, Object.keys(highlights).reduce((object, key) => {
      var value = highlights[key] && highlights[key][0]
      if(typeof value == 'string') value = <Markdown>{value}</Markdown>
      object[key] = value
      return object
    }, {}))

    return this.merged
  },

  buildPeekableDetail(field) {
    var {art} = this.props
    var highlights = this.artAndHighlights()

    return [
      field,
      art => [
        highlights[field],
        <Peek facet={field} q={art[field]} />
      ]
    ]
  },

  details() {
    return [
      ['title'],
      this.buildPeekableDetail('dated'),
      this.buildPeekableDetail('artist'),
      this.buildPeekableDetail('nationality'),
      ['role'],
      ['gallery', (art, raw) => [art.room, <Peek facet="room" q={raw.room} />]],
      this.buildPeekableDetail('department'),
      ['dimension', (art, rawArt) => [art.dimension, art.dimension && <div>
        {rawArt.dimension.match(/x.*cm/) && <Isvg src={dimensionSvg(art.id)} />}
      </div>]],
      ['credit', (art, raw) => [art.creditline, <Peek facet="creditline" q={raw.creditline} />]],
      ['accession_number'],
      this.buildPeekableDetail('medium'),
      this.buildPeekableDetail('country'),
      this.buildPeekableDetail('culture'),
      ['century', (art, raw) => [art.style, <Peek facet="style" q={raw.style} />]],
      ['provenance'],
      ['rights', (art, raw) => {
        return [(art.image_copyright || art.rights_type) && <div>
          {art.image_copyright && decodeURIComponent(art.image_copyright)}
          {art.image_copyright && art.rights_type && <br/>}
          {art.rights_type && <span>{art.rights_type}</span>}
        </div>,
        <Peek facet="rights_type" q={raw.rights_type} />
        ]
      }],
      ['marks'],
    ]
  },

  getInitialState() {
    return {
      expandDetailsMatrix: this.details().reduce((reduced, [field]) => {
        reduced[field] = field == 'dimension'
        return reduced
      }, {})
    }
  },

  render() {
    var {art, highlights} = this.props
    var skip = this.props.skipFields ? this.props.skipFields.split(' ') : []
    var details = this.details()
    if(highlights && highlights.description) details.push(['description'])
    details = details.filter(([field]) => skip.indexOf(field) < 0)
    .map(field => this.build(...field))
    .filter(detail => !!detail)

    return <dl className='artwork-detail'>
      {details}
    </dl>
  },
})

module.exports = ArtworkDetails
