var React = require('react')
var {isInternetArchivedPage} = require('../util/archived-page-handler.js')

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

      if(false && redirectUrl) {
        // `transition` happens at the server level and results
        // in a 301 redirect, which doesn't fix the problem with this site
        // archived on archive.org
        // Time for a better idea!
        transition.redirect(redirectUrl)
      }

      callback()
    },
  }
})


module.exports = NotFound
