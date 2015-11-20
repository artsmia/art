var React = require('react')
var Router = require('react-router')
var fetchComponentData = require('./fetch')
var ga = require('react-ga')

var routes = require('./routes')

ga.initialize(process.env.GA_TRACKING_ID)

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  ga.pageview(state.pathname)

  fetchComponentData(state).then(data => {
    React.render(<Handler {...state} data={data}/>, document.body)
  })
});

