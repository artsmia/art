var React = require('react')
var capitalize = require('capitalize')

var Markdown = require('./markdown')

var ArtworkDetails = React.createClass({
  build(field, fn) {
    var {art} = this.props
    var humanFieldName = capitalize.words(field).replace('_', ' ')
    var content = fn ? fn(art) : art[field]

    return <div className="detail-row">
      <div className="detail-title">{humanFieldName}</div>
      <div className='detail-content'>{content}</div>
    </div>
  },

  render() {
    var {art, highlights} = this.props
    var details = [
      ['title'],
      ['dated'],
      ['artist'],
      ['nationality'],
      ['role'],
      ['gallery', art => art.room],
      ['department'],
      ['dimension'],
      ['credit', art => art.creditline],
      ['accession_number'],
      ['medium'],
      ['country'],
      ['culture'],
      ['century', art => art.style],
      ['provenance', art => <Markdown>{art.provenance}</Markdown>],
      ['rights', art => {
        return <div>
          <span>{decodeURIComponent(art.image_copyright)}</span>
          {art.image_copyright && art.image_rights_type && <br/>}
          {art.image_rights_type && <span>{art.image_rights_type}</span>}
        </div>
      }]
    ].map(field => this.build(...field))

    return (
        <div>
          <h5 className='details-title'>Details</h5>
          <div className='artwork-detail'>
            {details}
          </div>
        </div>
    )
  },
})

module.exports = ArtworkDetails
