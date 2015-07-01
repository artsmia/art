var React = require('react')
var { Link } = require('react-router')

var Aggregations = React.createClass({
  render() {
    const search = this.props.search
    const aggs = search.aggregations
    const _aggs = []
    for(var agg in aggs) {
      var _agg = aggs[agg]
      _agg.name = agg
      _aggs.push(_agg)
    }
    // Sort aggregations in this order, with any others sorted last
    const order = ["Artist", "Country", "On View", "Room", "Image", "Image_rights_type", "Title", "Style"]
    _aggs.sort((a, b) => {
      [a, b] = [order.indexOf(a.name), order.indexOf(b.name)].map(index => index == -1 ? 100 : index)
      return a > b
    })

    const customFilters = {
      'On View': {
        'On View': 'room:G*',
        'Not on View': 'room:"Not on View"'
      },
      'Gist': {}
    }

    return (
      <div id="aggs" style={{width: '100%', overflowX: 'scroll', whiteSpace: 'nowrap', paddingBottom: '10px'}}>
        {_aggs.map(function(agg) {
          const aggIsActive = search.filters && search.filters.match(new RegExp(agg.name, 'i'))
          // (search.filters.match(new RegExp(agg.name, 'i')) || customFilters[agg.name] && search.filters.match(new RegExp(customFilters[agg.name])
          const showAgg = agg.buckets.length > 1 || aggIsActive
          if(showAgg) return (<dl key={agg.name} id={agg.name} style={{display: 'inline-block', margin: '0 1em', verticalAlign: 'top'}}>
            <dt style={{fontWeight: aggIsActive && 'bold'}}>{agg.name.replace(/_/g, ' ')}</dt>
            {agg.buckets.slice(0, 5).map(function(bucket) { 
              const filterString = customFilters[agg.name] ? customFilters[agg.name][bucket.key] || bucket.key : agg.name.toLowerCase()+':"'+encodeURIComponent(bucket.key)+'"'
              const filterRegex = new RegExp(decodeURIComponent(filterString).replace(/([\[\]\?])/, '\\$1'), 'i')
              const bucketIsActive = search.filters && search.filters.match(filterRegex)
              const newFilters = bucketIsActive ? 
                search.filters.replace(filterRegex, '').trim() :
                `${search.filters || ''} ${filterString}`.trim()
              const bucketText = `${bucket.key || '""'} - ${bucket.doc_count}`

              if(bucket.key) return (
                <dd key={agg.name+bucket.key} style={{margin: '0 0 0 1em', fontWeight: bucketIsActive && 'bold'}}>
                  {<Link to={newFilters == '' ? 'searchResults' : 'filteredSearchResults'} params={{terms: `${search.query}`, splat: newFilters}}>
                      {bucketText}
                  </Link>}
                </dd>
              )
            })}
          </dl>)
        })}
      </div>
    )
  }
})

module.exports = Aggregations
