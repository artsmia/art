var React = require('react')
var {Link} = require('react-router')

var Suggest = React.createClass({
  render() {
    var {search} = this.props
    var suggestions = Array.from(this.getSuggestions())
    .map(terms => terms.replace(/^Painter: /, '')) // remove `Painter: `. TODO expand to other constituent roles?
    .slice(0, 5)

    if(suggestions.length == 0) return <span className="noSuggestions"></span>

    var suggestionLinks = suggestions
    .map(name => <Link to={`/search/${name}`}>{name}</Link>)
    .map((link, index) => <span key={index}>{link}{index === suggestions.length-1 || ', '}</span>)

    var style = {marginBottom: '1em', textAlign: 'center', ...this.props.style}

    return <div id="suggestions" style={style}>
      <p>Looking for {suggestionLinks}?</p>
      <datalist id="searchCompletions">
        {suggestions.map(option => <option key={option}>{option}</option>)}
      </datalist>
    </div>
  },

  getSuggestions() {
    var {search} = this.props
    var suggest = this.props.completions || search && search.suggest || {}

    var suggestions = Object.keys(suggest)
    .filter(key => key !== '_shards' && suggest[key].length > 0)
    .map(key => suggest[key][0].options.map(suggestion => ({...suggestion, type: key})))
    .reduce((flattenedArray, options) => flattenedArray.concat(options), [])
    // re-score title completions to 10%, artist is more important
    .map(option => ({...option, score: option.score / (option.type == 'title_completion' ? 10 : 1)}))
    // re-score highlight completions
    .map(option => ({...option, score: option.score * (option.type == 'highlight_artist_completion' ? 5000 : 1)}))
    .sort((a, b) => a.score < b.score)
    .map(option => option ? option.text : null)
    .filter(text => search ? (text && text !== search.query) : true)

    return new Set(suggestions)
  },
})

module.exports = Suggest
