var React = require("react");
var ReactDOM = require("react-dom");
var Router = require("react-router");
var fetchComponentData = require("./fetch");
var fathom = require("fathom-client");
var { isInternetArchivedPage } = require("./src/util/archived-page-handler.js");

var routes = require("./routes");

var trackAnalytics = process.env.NODE_END === "production";

if (trackAnalytics)
  Fathom.load("PXCWTLRI", {
    includedDomains: ["collections.artsmia.org"],
  });

const url = new URL(window.location.href);
if (url.pathname.length > 2 && url.pathname.endsWith("/")) {
  url.pathname = url.pathname.substring(0, url.pathname.length - 1);
  console.log(url.toString());
  history.replaceState({}, "", url.toString());
}

// Patch react-router to render the correct pages even when they're archived
// with a different URL at the internet archive
Router.HistoryLocation.__unpatched__getCurrentPath =
  Router.HistoryLocation.getCurrentPath;
Router.HistoryLocation.getCurrentPath = function getCurrentPath() {
  // re-write `pathname` to render even when this page is archived at the internet
  // archive…
  var iaPathRegex = new RegExp("/web/[0-9]+/https://collections.artsmia.org");
  var pathnameWithoutWaybackPrefix = window.location.pathname.replace(
    iaPathRegex,
    ""
  );

  return decodeURI(pathnameWithoutWaybackPrefix + window.location.search);
};

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  if (trackAnalytics) Fathom.trackPageview();
  window.privilegedClientIP = true;
  window.__DATA__ = null;

  fetchComponentData(state).then((data) => {
    ReactDOM.render(
      <Handler {...state} data={data} />,
      document.querySelector("#app")
    );
  });
});
