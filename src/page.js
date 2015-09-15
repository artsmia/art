var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')
var rest = require('rest')

var Search = require('./search')
var SearchResults = require('./search-results')
var Markdown = require('./markdown')
var Peek = require('./peek')

var Page = React.createClass({
  statics: {
    fetchData: {
      page: (params, query) => rest("http://artsmia.github.io/collection-info/index.json")
        .then(r => JSON.parse(r.entity).pages)
        .then(pages => pages[params.name]),
      searchResults: (params, query) => Page.fetchData.page(params, query)
        .then(page => SearchResults.fetchData.searchResults({terms: page.query}))
    }
  },

  render() {
    var {title, content, query} = this.props.data.page

    return <section className="page">
      {query && <Search
        hideResults={true}
        hideInput={true}
        facet={query}
        {...this.props}
      />}

      <div className="pageText">
        <h1>{title}</h1>
        <Markdown>{content}</Markdown>
      </div>

      {query && <Peek q={query} quiltProps={{maxRowHeight: 400}} offset={10} />}
      <Helmet title={title} />
    </section>
  },
})

module.exports = Page
