var React = require('react')
var Router = require('react-router')

var ImageQuilt = require('../image-quilt')
var ArtworkImage = require('../artwork-image')
var Markdown = require('../markdown')
var Sticky = require('react-sticky')

var SearchResultsD = React.createClass({
  mixins: [Router.Navigation],

  render() {
    var {hits, focusedResult} = this.props

    return <div>
      <div style={{maxWidth: '45%', float: 'left'}}>
        <ImageQuilt artworks={hits}
          maxRows={1000}
          rowHeight={125}
          onClick={this.clickResult}
          disableHover={true} />
      </div>
      {focusedResult && <div style={{maxWidth: '54%', float: 'right'}}><Sticky stickyStyle={{right: 0, top: 0, position: 'fixed', width: '54%'}}>
        <h2>{focusedResult.title}, <span className='date'>{focusedResult.dated}</span></h2>
        <h5>{focusedResult.artist}</h5>
        <ArtworkImage art={focusedResult} id={focusedResult.id} />
        <div className='tombstone'>
          {focusedResult.medium}<br />
          {focusedResult.dimension}<br/>
          {`${focusedResult.creditline} ${focusedResult.accession_number}`}
        </div>
        <Markdown>{focusedResult.text}</Markdown>
    </Sticky></div>}

    </div>
  },

  clickResult(art) {
    this.props.focusHandler(art)
  },
})

module.exports = SearchResultsD
