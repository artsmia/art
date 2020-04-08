var React = require('react')

var highlighter = require('../highlighter')
var Markdown = require('../markdown')

var Creator = React.createClass({
  render() {
    var Peek = require('../peek') // required here to avoid circular react dependency - yikes!
    var Wrapper = this.props.wrapper || "h5"
    var [facet, value, highlightedValue] = Creator.getFacetAndValue(this.props.art, this.props.highlights)
    var creatorPeek = (facet == 'artist' || facet == 'culture')
      && <Peek microdata={true} facet={facet} {...{highlightedValue}}>{value}</Peek>
      || facet == 'country'
      && <span>Unknown artist, <Peek microdata={true} facet="country" tag="span" showIcon={this.props.showIcon} {...{highlightedValue}}>{value}</Peek></span>

    return <Wrapper itemProp="creator" itemScope itemType="https://schema.org/Person">
      {this.props.peek && this.props.showPeeks ? creatorPeek : (highlightedValue ? <Markdown>{highlightedValue}</Markdown> : value)}
    </Wrapper>
  },

  getDefaultProps() {
    return {peek: true, showPeeks: true}
  },
})
Creator.getFacetAndValue = (art, highlights) => {
  var {artist, culture, country} = art
  var highlight = highlighter.bind(null, art, highlights)

  return !(artist == '' || artist && artist.match(/^unknown/i)) &&
    ['artist', (art.artist || '').replace(/^([^;]+):/, ''), highlight('artist').replace(/^([^;]+):/, '')]
  || !!culture
    && ['culture', art.culture.replace(/ culture/i, ''), highlight('culture').replace(/ culture/i, '')]
  || !!country
    && ['country', art.country, highlight('country')]
  || [undefined, undefined]
}

module.exports = Creator
