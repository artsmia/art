var React = require('react')
var {Link} = require('react-router')

var Suggest = React.createClass({
  render() {
    var {search} = this.props
    var suggestions = this.getSuggestions()
    .slice(0, 5)

    if(suggestions.length == 0) return <span></span>

    var suggestionLinks = suggestions
    .map(name => <Link to={`/search/${name}`}>{name}</Link>)
    .map((link, index) => <span>{link}{index === suggestions.length-1 || ', '}</span>)

    return <div id="suggestions" style={{marginBottom: '1em', textAlign: 'center'}}>
      <p>Looking for {suggestionLinks}?</p>
      <datalist id="searchCompletions">
        {suggestions.map(option => <option>{option}</option>)}
      </datalist>
    </div>
  },

  getSuggestions() {
    var {search} = this.props
    var suggest = this.props.completions || search.suggest

    var suggestions = Object.keys(suggest)
    .filter(key => key !== '_shards')
    .map(key => suggest[key][0].options.map(suggestion => ({...suggestion, type: key})))
    .reduce((flattenedArray, options) => flattenedArray.concat(options), [])
    // re-score title completions to 10%, artist is more important
    .map(option => ({...option, score: option.score / (option.type == 'title_completion' ? 10 : 1)}))
    // re-score highlight completions to 10x
    .map(option => ({...option, score: option.score * (option.type == 'highlight_artist_completion' ? 10 : 1)}))
    .sort((a, b) => a.score < b.score)
    .map(option => option ? option.text : null)
    .filter(text => text && text !== search.query)


    return suggestions
  },
})

module.exports = Suggest
