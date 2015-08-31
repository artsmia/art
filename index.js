var React = require('react')
var Router = require('react-router')
var fetchComponentData = require('./fetch')

var routes = require('./routes')

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  fetchComponentData(state).then(data => {
    React.render(<Handler {...state} data={data}/>, document.body)
  })
});

