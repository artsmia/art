var React = require('react')
var Router = require('react-router')
var fetchComponentData = require('./fetch')
var ga = require('react-ga')

var routes = require('./routes')
var trackAnalytics = process.env.NODE_ENV == 'production'

if(trackAnalytics) ga.initialize(process.env.GA_TRACKING_ID)

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  if(trackAnalytics) ga.pageview(state.pathname)

  fetchComponentData(state).then(data => {
    React.render(<Handler {...state} data={data}/>, document.body)
  })
});

