var React = require('react')
var {Link} = require('react-router')

var Suggest = React.createClass({
  render() {
    var {search} = this.props
    var suggestions = this.getSuggestions()
    .slice(0, 5)
    .map(name => <Link to={`/search/${name}`}>{name}</Link>)
    .map((link, index) => <span>{link}, </span>)

    if(suggestions.length == 0) return <span></span>

    return <p>Looking for {suggestions}?</p>
  },

  getSuggestions() {
    var {search} = this.props
    var suggest = search.suggest

    var suggestions = Object.keys(suggest)
    .map(key => suggest[key][0].options)
    .reduce((flattenedArray, options) => flattenedArray.concat(options), [])
    .sort((a, b) => a.score < b.score)
    .map(option => option ? option.text : null)
    .filter(text => text && text !== search.query)

    return suggestions
  },
})

module.exports = Suggest
