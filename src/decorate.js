var React = require('react')

var Markdown = require('./markdown')

var DepartmentDecorator = require('./decorate/department')

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
  let terms = search.split(' ')
  if(filters) terms = terms.concat(filters.split('" ').map(f => f.trim()))

  var Decor = {
    "department:": (term) => <DepartmentDecorator department={term} params={params} />
  }

  let m = Object.keys(Decor).reduce((matches, d) => {
    var _m = terms.filter(term => term.match(new RegExp(d)))
    if(_m.length > 0) matches[d] = _m
    return matches
  }, {})

  return Object.keys(m).map(key => {
    return Decor[key](m[key])
  })
}
