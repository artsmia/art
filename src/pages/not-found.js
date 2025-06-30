var React = require("react");
var { isInternetArchivedPage } = require("../util/archived-page-handler.js");

var coverPageStyle = {
  textAlign: "center",
  background: "#232323",
  minHeight: "100vh",
};

var NotFound = React.createClass({
  render() {
    return (
      <div style={coverPageStyle}>
        <h2 style={{ color: "white", fontSize: "333%", paddingTop: "17%" }}>
          404 Not Found
        </h2>
      </div>
    );
  },

  statics: {
    willTransitionTo: function (transition, params, query, callback) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname === "/search"
      ) {
        const q = new URLSearchParams(location.search).get("q");
        if (q) {
          window.location = `/search/${q}`;
          return;
        }
      }

      var redirectUrl = params && isInternetArchivedPage(params.splat);

      if (false && redirectUrl) {
        // `transition` happens at the server level and results
        // in a 301 redirect, which doesn't fix the problem with this site
        // archived on archive.org
        // Time for a better idea!
        transition.redirect(redirectUrl);
      }

      callback();
    },
  },
});

module.exports = NotFound;
