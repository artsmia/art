var React = require('react')
var Router = require('react-router')
var express = require('express')
var fs = require('fs')
var index = fs.readFileSync('./index.html', 'utf-8')

var fetchComponentData = require('./fetch')
var routes = require('./routes')

var app = express()
var serveStatic = require('serve-static')
app.locals.settings['x-powered-by'] = false

if(typeof window === "undefined") GLOBAL.window = GLOBAL

app.get('/search/', (req, res, next) => {
  // catch searches with JS disabled
  var match = req.url.match(/\/search\/\?q=(.*)/)
  if(match && match[1]) return res.redirect(301, '/search/'+match[1])
  next()
})

app.use(function home (req, res, next) {
  var context = {
    routes: routes,
    location: req.url,
  }
  
  Router.create(context).run((Handler, state) => {
    if(state.routes.length === 0) return next()
    fetchComponentData(state).then(data => {
      res.send(index + React.renderToString(<Handler {...state} data={data} universal={true} />))
    })
  })
})

app.use(serveStatic('.'))

app.listen(process.env.PORT || 3413)
