var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')
var express = require('express')
var ga = require('react-ga')
var fs = require('fs')
var index = fs.readFileSync('./index.html', 'utf-8')

var fetchComponentData = require('./fetch')
var routes = require('./routes')

var app = express()
var serveStatic = require('serve-static')
app.locals.settings['x-powered-by'] = false

if(typeof window === "undefined") GLOBAL.window = GLOBAL

// ga.initialize(process.env.GA_TRACKING_ID)

app.get('/search/', (req, res, next) => {
  // catch searches with JS disabled
  var match = req.url.match(/\/search\/\?q=(.*)/)
  if(match && match[1]) return res.redirect(301, '/search/'+match[1])
  next()
})

var html = ({title, meta, link}, body) => index
  .replace('<!--HEAD-->', [`<title>${title}</title>`, meta, link]
    .filter(e => e).join('  \n'))
  .replace('<!--BODY-->', body);

app.use((req, res, next) => {
  var router = Router.create({
    routes,
    location: req.url,
    onAbort: ({to, params, query}) => {
      var url = to && router.makePath(to, params, query) || '/'
      res.redirect(301, url)
    },
  })

  if(!router.match(req.url)) return next()

  router.run((Handler, state) => {
    // ga.pageview(state.pathname)

    fetchComponentData(state).then(data => {
      var body = React.renderToString(<Handler {...state} data={data} universal={true} />)
      res.send(html(Helmet.rewind(), body))
    })
  })
})

app.use(serveStatic('.'))

var port = process.env.PORT || 3413
app.listen(port, () => console.info('👌 ', port))
