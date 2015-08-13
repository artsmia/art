var React = require('react')

var ArtworkImage = require('../artwork-image')
var Markdown = require('../markdown')

var SearchResultsB = React.createClass({
  render() {
    var {results, focusedResult} = this.props

    return (
      <div className='search-results-wrap clearfix'>
        <div className='objects-wrap' style={{clear: 'both'}}>{results}</div>
        {focusedResult && <div className='objects-focus'>
            <h2>{focusedResult.title}, <span className='date'>{focusedResult.dated}</span></h2>
            <h5>{focusedResult.artist}</h5>
            <ArtworkImage art={focusedResult} id={focusedResult.id} />
            <div className='tombstone'>
              {focusedResult.medium}<br />
              {focusedResult.dimension}<br/>
              {`${focusedResult.creditline} ${focusedResult.accession_number}`}
            </div>
            <Markdown>{focusedResult.text}</Markdown>
        </div>}
      </div>
    )
  },
})

module.exports = SearchResultsB
