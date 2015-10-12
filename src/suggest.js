var React = require('react')
var {Link} = require('react-router')

var Suggest = React.createClass({
  render() {
    var {search} = this.props
    var links = this.getSuggestions()
    .slice(0, 5)
    .map(name => <Link to={`/search/${name}`}>{name}</Link>)
    .map((link, index) => <span>{link} </span>)

    return links.length > 0 ?
      <p>Did you mean {links}?</p> :
      <span></span>
  },

  getSuggestions() {
    var {search} = this.props
    var suggest = search.suggest

    var suggestions = Object.keys(suggest).map(key => suggest[key])
    .map(suggestion => suggestion[0].options)[0]
    .map(option => option.text)

    return suggestions
  },
})

module.exports = Suggest
