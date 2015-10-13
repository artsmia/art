var React = require('react')

var ArtworkDetails = React.createClass({

  render() {
    var art = this.props.art

    return (
        <div>
          <h5 className='details-title'>Details</h5>
          <div className='artwork-detail'>
            <div className='detail-row'>
                <div className='detail-title'>Title</div>
                <div className='detail-content'>{art.title}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Dated</div>
                <div className='detail-content'>{art.dated}</div>
            </div>
             <div className='detail-row'>
                <div className='detail-title'>Artist</div>
                <div className='detail-content'>{art.artist}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Nationality</div>
                <div className='detail-content'>{art.nationality}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Role</div>
                <div className='detail-content'>{art.role}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Gallery</div>
                <div className='detail-content'>{art.room}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Department</div>
                <div className='detail-content'>{art.department}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Dimension</div>
                <div className='detail-content'>{art.dimension}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Credit</div>
                <div className='detail-content'>{art.creditline}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Accession Number</div>
                <div className='detail-content'>{art.accession_number}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Medium</div>
                <div className='detail-content'>{art.medium}</div>
            </div>
            <div className='detail-row'>
                <div className='detail-title'>Country</div>
                <div className='detail-content'>{art.country}</div>
            </div>
             <div className='detail-row'>
                <div className='detail-title'>Culture</div>
                <div className='detail-content'>{art.culture}</div>
            </div>
             <div className='detail-row'>
                <div className='detail-title'>Century</div>
                <div className='detail-content'>{art.style}</div>
            </div>
             <div className='detail-row'>
                <div className='detail-title'>Provenance</div>
                <div className='detail-content'>{art.provenance}</div>
            </div>
             <div className='detail-row'>
                <div className='detail-title'>Rights</div>
                <div className='detail-content'>
                  <span>{decodeURIComponent(art.image_copyright)}</span>
                  {art.image_copyright && art.image_rights_type && <br/>}
                  {art.image_rights_type && <span>{art.image_rights_type}</span>}
                </div>
            </div>
          </div>
        </div>
    )
  },
})

module.exports = ArtworkDetails
