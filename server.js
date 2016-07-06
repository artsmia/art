var React = require('react')
var Router = require('react-router')
var Helmet = require('react-helmet')
var express = require('express')
var ga = require('react-ga')
var {parse} = require('useragent')
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

var html = ({title, meta, link}, data, body) => index
  .replace('<!--HEAD-->',
           [
             `<title>${title}</title>`,
             meta,
             link,
             `<script>window.__DATA__ = ${JSON.stringify(data)};</script>`
           ]
    .filter(e => e).join('  \n'))
  .replace('<!--BODY-->', body);

function sniffUserAgent (req, res, next) {
  const nonalpha = /[^a-z]/g;
  const agent = req.headers['user-agent'];
  const {family, source} = parse(agent);
  let ua = family.toLowerCase().replace(nonalpha, '');
  if(source.match(/iphone/i)) ua += ' palm'
  req.ua = ua;
  next();
}; // https://ponyfoo.com/articles/double-edged-sword-web?
app.use(sniffUserAgent)

app.use((req, res, next) => {
  var router = Router.create({
    routes,
    location: req.url,
    onAbort: ({to, params, query}) => {
      var url = to && router.makePath(to, params, query) || '/'
      res.redirect(302, url)
    },
  })

  if(!router.match(req.url)) return next()

  router.run((Handler, state) => {
    // ga.pageview(state.pathname)

    window.__DATA__ = undefined

    fetchComponentData(state).then(data => {
      var body = React.renderToString(<Handler {...state} ua={req.ua} data={data} universal={true} />)
      res.send(html(Helmet.rewind(), data, body))
    })
  })
})

app.use(serveStatic('.'))

var port = process.env.PORT || 3413
app.listen(port, () => console.info('👌 ', port))
