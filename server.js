var React = require("react")
var ReactDOM = require("react-dom/server")
var Router = require("react-router")
var Helmet = require("react-helmet")
var express = require("express")
var ga = require("react-ga")
var fs = require("fs")
var index = fs.readFileSync("./index.html", "utf-8")

var fetchComponentData = require("./fetch")
var routes = require("./routes")

var app = express()
var serveStatic = require("serve-static")
app.locals.settings["x-powered-by"] = false
app.enable("trust proxy")

if (typeof window === "undefined") {
	global.window = global
	global.window.serverRendered = true
}

// ga.initialize(process.env.GA_TRACKING_ID)

app.get("/search/", (req, res, next) => {
	// catch searches with JS disabled
	var match = req.url.match(/\/search\/\?q=(.*)/)
	if (match && match[1]) return res.redirect(301, "/search/" + match[1])
	next()
})

var html = ({ title, meta, link }, data, body) => {
	const renderedHead = [`${title}`, meta, link, `<script>window.__DATA__ = ${JSON.stringify(data)};</script>`]
		.filter((e) => e)
		.join("  \n")
		.replace(/ data-react-helmet="true"/g, "")

	return index.replace("<!--HEAD-->", renderedHead).replace("<!--BODY-->", body)
}

app.use(serveStatic("."))

app.use((req, res, next) => {
	var actingUrl = req.url.replace(/\/(.*)\/$/, "/$1")
	const internalIPs = process.env.PRIVILEGED_IP_LIST
	var privilegedClientIP = internalIPs !== undefined ? internalIPs.split(" ").indexOf(req.ip) > -1 : undefined
	window.privilegedClientIP = privilegedClientIP // FIXME how to pass this other than as a global?

	var router = Router.create({
		routes,
		location: actingUrl,
		onAbort: ({ to, params, query }) => {
			var url = (to && router.makePath(to, params, query)) || "/"
			if (params && params.status == 403) return res.sendStatus(403)
			res.redirect((params && params.status) || 301, url)
		}
	})

	if (!router.match(actingUrl)) return next()

	router.run((Handler, state) => {
		// ga.pageview(state.pathname)
		fetchComponentData(state).then((data) => {
			var handler = (
				<Handler
					{...state}
					data={data}
					universal={true}
					clientIp={req.ip}
					privilegedClientIP={privilegedClientIP}
					userAgent={req.headers["user-agent"]}
				/>
			)
			var body = ReactDOM.renderToString(handler)
			res.send(html(Helmet.rewind(), data, body))
		})
	})
})

var port = process.env.PORT || 3413
app.listen(port, () => console.info("👌 ", port))
