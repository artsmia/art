var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var fetchComponentData = require('./fetch')

var routes = require('./routes')

window.history && history.replaceState({}, '', window.location.href.replace(/\/(.*)\/$/, '/$1'))

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  window.privilegedClientIP = true

  var rehydratedData = window.__DATA__
  window.__DATA__ = null

  fetchComponentData(state, rehydratedData).then(data => {
    ReactDOM.render(<Handler {...state} data={data} />, document.querySelector('#app'))
  })
});

