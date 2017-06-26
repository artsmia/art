var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var fetchComponentData = require('./fetch')
var ga = require('react-ga')

var routes = require('./routes')
var trackAnalytics = process.env.NODE_ENV == 'production'

if(trackAnalytics) ga.initialize(process.env.GA_TRACKING_ID)

window.history && history.replaceState({}, '', window.location.href.replace(/\/(.*)\/$/, '/$1'))

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  if(trackAnalytics) ga.pageview(state.pathname)
  window.privilegedClientIP = true

  var rehydratedData = window.__DATA__
  window.__DATA__ = null

  fetchComponentData(state, rehydratedData).then(data => {
    ReactDOM.render(<Handler {...state} data={data} />, document.querySelector('#app'))
  })
});

