var React = require('react')
var Router = require('react-router')
var rest = require('rest')
var Helmet = require('react-helmet')

var Search = require('./search')
var endpoints = require('./endpoints')
var SEARCH = endpoints.search
var toSlug = require('speakingurl')
var Markdown = require('./markdown')

var Exhibition = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: {
      exhibition: (params) => {
        var {id} = params
        return rest(endpoints.exhibition(id))
        .then((r) => JSON.parse(r.entity))
        .then(exh => {
          exh.slug = toSlug(exh.exhibition_title)
          return exh
        })
      },

      searchResults: (params, query) => {
        return Exhibition.fetchData.exhibition(params).then(exhibition => {
          const {objects, exhibition_id: id} = exhibition
          var searchUrl = `${SEARCH}/ids/${objects.join(',')}`
          return rest(searchUrl)
          .then((r) => JSON.parse(r.entity))
          .then((json) => {
            // Publish artworks mainly based on `public_access: 1`, but whitelist
            // specific exhibitions to show all works, regardless of public_access status
            const loanExhibitionWhitelist = [2802, 2778]
            const exhibitionWhitelisted = loanExhibitionWhitelist.indexOf(id) > -1
            const publishableArtworks = exhibitionWhitelisted
              ? json.hits.hits
              : json.hits.hits.filter(({_source: s}) => s && s.public_access == "1")

            const ids = publishableArtworks.map(hit => hit._id)

            const publicAccessResults = {hits: {total: publishableArtworks.length, hits: publishableArtworks}}
            return {
              ...publicAccessResults,
              csvQuery: `ids/${ids.join(',')}`,
            }
          })
        })
      },
    },

    willTransitionTo: function (transition, params, query, callback) {
      Exhibition.fetchData.exhibition(params).then(exhibition => {
        if(exhibition.slug !== params.slug) {
          params.slug = exhibition.slug
          transition.redirect('exhibitionSlug', params)
        }
      })
      .catch(err => transition.redirect('home'))
      .then(callback)
    },
  },

  render() {
    var {exhibition} = this.props.data

    return <div>
      <Search
        {...this.props}
        disableHover={true} // TODO: fix :hover going to the search results page
      >
        <div style={{margin: '0.5em 3em 2em', maxWidth: '37em'}}>
          <h2>{exhibition.exhibition_title}</h2>
          <p style={{margin: '-1em 0 0.5em 0'}}>{exhibition.display_date}</p>
          <Markdown>{exhibition.exhibition_description}</Markdown>
        </div>
        <hr />
      </Search>
      <Helmet
        title={`Exhibition: ${exhibition.exhibition_title}`}
        meta={[
          {property: "og:title", content: exhibition.exhibition_title + ' ^ Minneapolis Institute of Art'},
          {property: "og:description", content: `An exhibition at the Minneapolis Institute of Art. ${exhibition.display_date}`},
        ]}
      />
    </div>
  },
})

module.exports = Exhibition
