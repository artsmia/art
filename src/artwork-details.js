var React = require('react')
var {Link} = require('react-router')
var capitalize = require('capitalize')
var Isvg = require('react-inlinesvg')
var cx = require('classnames')
var ClickToSelect = require('react-click-to-select')

var Markdown = require('./markdown')
var Peek = require('./peek')
var dimensionSvg = require('./endpoints').dimensionSvg
var rightsDescriptions = require('./rights-types.js')

var ArtworkDetails = React.createClass({
  build(field, fn) {
    var {art, highlights} = this.props
    if(this.props.onlyShowHighlightDetails && !highlights[field]) return

    var humanFieldName = capitalize.words(field).replace('_', ' ')
    var artAndHighlights = this.artAndHighlights()
    var [content, extraContent] = fn ? fn(artAndHighlights, art) : [artAndHighlights[field]]
    if(!content || content == '') return
    var showExtra = extraContent && this.state.expandDetailsMatrix[field]
    var classes = cx("detail-row", {expandable: extraContent}, field)

    return <div className={classes} key={field}>
      <div onClick={this.toggleExtra.bind(this, field)}>
        <dt className="detail-title">{humanFieldName}</dt>
        <dd className='detail-content'>{content}</dd>
      </div>
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

    return !highlights ? art : Object.assign({...art}, Object.keys(highlights).reduce((object, key) => {
      var value = highlights[key] && highlights[key][0]
      if(typeof value == 'string') value = <Markdown>{value}</Markdown>
      object[key] = value
      return object
    }, {}))
  },

  buildPeekableDetail(field, extra) {
    var {art} = this.props
    var highlights = this.artAndHighlights()

    return [
      field,
      art => [
        highlights[field],
        <div>
          {extra}
          <Peek facet={field} q={art[field]} />
        </div>
      ]
    ]
  },

  details() {
    return [
      ['deaccessioned', (art, raw) => [
        raw.deaccessioned && `${art.deaccessionedDate}`, <div>
          {raw.deaccessionedReason && <p>{raw.deaccessionedReason}</p>}
          <Link to="/info/deaccessions">Artworks are deaccessioned for many reasons</Link>
        </div>
      ]],
      ['title'],
      this.buildPeekableDetail('dated'),
      this.buildPeekableDetail('artist', this.props.art.life_date),
      this.buildPeekableDetail('nationality'),
      ['artist life', (art) => [art.life_date && art.life_date.replace(new RegExp(art.nationality+"(, )?"), '')]],
      ['role'],
      ['gallery', (art, raw) => [art.room, <Peek facet="room" q={raw.room} />]],
      this.buildPeekableDetail('department'),
      ['dimension', (art, rawArt) => {
        var showFancyDimension = art.dimension && this.dimensions().length > 0

        return [
          art.dimension && <div>{showFancyDimension ? this.dimensions().map(([d, aspect]) => {
            return <span style={{display: 'block'}} onMouseEnter={this.toggleDimensionGraphic.bind(this, aspect)} key={aspect}>{d}</span>
          }) : art.dimension}</div>,
          showFancyDimension && <div>
            {rawArt.dimension.match(/cm/) && <Isvg
              src={dimensionSvg(art.id, this.state.dimensionGraphicName)}
              key={this.state.dimensionGraphicName}
              onLoad={this.dimensionSvgLoaded}
            />}
          </div>
        ]
      }],
      ['credit', (art, raw) => [art.creditline, <Peek facet="creditline" q={raw.creditline} />]],
      ['accession_number'],
      this.buildPeekableDetail('medium'),
      this.buildPeekableDetail('country'),
      this.buildPeekableDetail('culture'),
      ['century', (art, raw) => [art.style, <Peek facet="style" q={raw.style} />]],
      ['provenance'],
      ['rights', (art, raw) => {
        return [(art.image_copyright || art.rights) && <div>
          {art.image_copyright && decodeURIComponent(art.image_copyright)}
          {art.image_copyright && art.rights && <br/>}
          {art.rights && <span>{art.rights}</span>}
        </div>,
        <div>
          <p>{rightsDescriptions[raw.rights]}</p>
          <Peek facet="rights" q={raw.rights} />
          <p><a href="http://new.artsmia.org/visit/policies-guidelines/#websiteimageaccess&use">Mia's Image Access & Use Policy</a></p>
        </div>
        ]
      }],
      // apparently markings/inscription/signed are 'for our eyes only'
      // ['markings', (art) => {
      //   // show deprecated `marks` field if none of the new `markings, signature, inscription` fields exist yet
      //   return [art.markings || (!art.signature && !art.inscription && art.marks)]
      // }],
      // ['inscription'],
      // ['signed'],
      ['classification', (art, raw) => {
        if(!art.classification) return []

        var classificationPeeks = art.classification.split(',')
        .map(classification => <Peek facet="classification" q={classification} />)

        return [
          <p>{art.classification}</p>,
          <div>{classificationPeeks}</div>
        ]
      }],
      ['tags', art => {
        if(!art.tags) return []

        var linkedTags = art.tags.trim().split(' ')
        .map(tag => <Link to="searchResults" params={{terms: `tags:${tag}`}} key={tag}>{tag.replace(/-/g, ' ')}</Link>)

        return [<p>{linkedTags.map((tag, index) => {
          return <span key={index}>{tag}{(index == linkedTags.length-1 || ', ')}</span>
        })}</p>]
      }],
      ['wikipedia', (art) => {
        return ['Cite this information', <div>
          <ClickToSelect>
            <code name="Mia">&#123;&#123;cite web |title={art.title} |url=http://collections.artsmia.org/art/{art.id} |author={art.artist} |year={art.dated} |accessdate={(new Date).toUTCString().split(' ').slice(1, 4).join(' ')} |publisher=Minneapolis Institute of Art&#125;&#125;</code>
          </ClickToSelect>
        </div>]
      }],
      ['exhibition history', (art) => {
        if(!art.exhibition_history) return []
        return [<Markdown>{art.exhibition_history}</Markdown>]
      }]
    ]
  },

  getInitialState() {
    var dimensions = this.dimensions()
    var firstDimensionName = dimensions && dimensions[0] && dimensions[0][1]
    var expandDetails = this.details().reduce((reduced, [field]) => {
      reduced[field] = false
      return reduced
    }, {})
    expandDetails['dimension'] = !!firstDimensionName

    return {
      expandDetailsMatrix: expandDetails,
      dimensionGraphicName: firstDimensionName,
    }
  },

  render() {
    var {art, highlights} = this.props
    var skip = this.props.skipFields ? this.props.skipFields.split(' ') : []
    var details = this.details()
    .filter(([field]) => skip.indexOf(field) < 0)
    .map(field => this.build(...field))
    .filter(detail => !!detail)

    return <dl className='artwork-detail'>
      {details}
    </dl>
  },

  dimensions() {
    var {dimension} = this.props.art
    if(!dimension) return []
    // var dimension = this.props.highlights ? this.props.highlights.dimension : this.props.art
    return dimension.split("\r\n")
    .filter(string => string.match(/[x\|×].*cm/))
    .map(string => {
      var aspect = string.match(/cm\)\s\(*([^\(]+)\)$/)

      return [string, aspect ? aspect[1].replace(/[^a-zA-z]+/g, '-').replace(/^-|-$/, '') : 'dimensions']
    })
  },

  toggleDimensionGraphic(aspect) {
    this.setState({dimensionGraphicName: aspect})
  },

  dimensionSvgLoaded() {
    if(this.state.heightAdjusted) return
    this.setState({heightAdjusted: true})
    var domNode = React.findDOMNode(this)
    this.context.onHeightChange && this.context.onHeightChange(domNode.parentElement.parentElement.parentElement.parentElement.clientHeight)
  },
})
ArtworkDetails.contextTypes = {
  onHeightChange: React.PropTypes.func,
}

module.exports = ArtworkDetails
