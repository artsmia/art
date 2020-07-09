var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var fetchComponentData = require('./fetch')
var fathom = require('fathom-client')

var routes = require('./routes')

var trackAnalytics = process.env.NODE_END === 'production'

if(trackAnalytics) Fathom.load('PXCWTLRI', {
  includedDomains: ['collections.artsmia.org']
})

window.history && history.replaceState({}, '', window.location.href.replace(/\/(.*)\/$/, '/$1'))

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  if(trackAnalytics) Fathom.trackPageview()
  debugger
  window.privilegedClientIP = true

  var rehydratedData = window.__DATA__
  window.__DATA__ = null

  fetchComponentData(state, rehydratedData).then(data => {
    ReactDOM.render(<Handler {...state} data={data} />, document.querySelector('#app'))
  })
});

