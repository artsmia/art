var React = require('react')

var Markdown = require('./markdown')

var DepartmentDecorator = require('./decorate/department')
var GalleryDecorator = require('./decorate/gallery')
var HighlightsDecorator = require('./decorate/highlights')

var Decorate = React.createClass({
  render() {
    var {query, filters} = this.props.search
    if(!query && !filters) return <span />
    var decorations = DecorationFinder(query, filters, this.props.params)
    return <div>
      {decorations}
    </div>
  }
})

module.exports = Decorate

var DecorationFinder = (search, filters, params) => {
  let terms = search.match(/\w+.+|"(?:\\"|[^"])+"/g) || search.split(' ')
  if(filters) terms = terms.concat(filters.split('" ').map(f => f.trim()))

  var Decor = {
    "department:": (term) => <DepartmentDecorator department={term} params={params} />,
    "g[0-9]{3}a?": (gallery) => <GalleryDecorator gallery={gallery[0]} />,
    "Not on View": (gallery) => <GalleryDecorator notOnView={true} />,
    "highlight:": () => <HighlightsDecorator />,
  }

  let m = Object.keys(Decor).reduce((matches, d) => {
    var _m = terms.filter(term => term.match(new RegExp(d, 'i')))
    if(_m.length > 0) matches[d] = _m
    return matches
  }, {})

  return Object.keys(m).map(key => {
    return Decor[key](m[key])
  })
}
