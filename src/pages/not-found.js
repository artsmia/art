var React = require('react')

var coverPageStyle = {
  textAlign: 'center',
  background: '#232323',
  minHeight: '100vh',
}

var NotFound = React.createClass({
  render() {
    return <div style={coverPageStyle}>
      <h2 style={{color: 'white', fontSize: '333%', paddingTop: '17%'}}>404 Not Found</h2>
    </div>
  },

  statics: {
    willTransitionTo: function (transition, params, query, callback) {
      var redirectUrl = params && isInternetArchivedPage(params.splat)

      if(redirectUrl) {
        console.info('re-route for IA archived page', {
          redirectUrl,
        })
        transition.redirect(redirectUrl)
      }

      callback()
    },
  }
})

function isInternetArchivedPage(url) {
  var internetArchiveUrlRegex = new RegExp("/?web/[0-9]+/http://collections.artsmia.org(.*)")
  var isInternetArchivedPage = url && url.match(internetArchiveUrlRegex)
  var pageUrl = isInternetArchivedPage && isInternetArchivedPage[1]

  return pageUrl
}

module.exports = NotFound
