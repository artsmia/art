var React = require("react");
var { Link } = require("react-router");
var { isInternetArchivedPage } = require("../util/archived-page-handler.js");
var Footer = require("../footer");

var WORDMARK_SRC =
  "https://mia-styleguide.s3.amazonaws.com/dist/images/mia-wordmark.svg";
var WORDMARK_FALLBACK = "/images/MIA_LOGO_WORDMARK.svg";
var ERROR_IMG =
  "https://s3.amazonaws.com/mia-images/not-found.jpg";

var NotFound = React.createClass({
  componentDidMount() {
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.add("not-found-page");
    }
  },

  componentWillUnmount() {
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.remove("not-found-page");
    }
  },

  render() {
    return (
      <div className="not-found-page">
        <div className="container">
          <div className="not-found-wordmark">
            <Link to="home" aria-label="Minneapolis Institute of Art">
              <img
                src={WORDMARK_SRC}
                alt="Minneapolis Institute of Art"
                onError={(e) => {
                  if (e.target.src !== WORDMARK_FALLBACK) {
                    e.target.src = WORDMARK_FALLBACK;
                  }
                }}
              />
            </Link>
          </div>
          <main>
            <img
              src={ERROR_IMG}
              alt='A black and white photo of several women standing beside a chalkboard twice and a handmade sign which read "Lost Persons Dept"'
            />
            <h1>404. Sorry! Couldn't find that page :(</h1>
            <p>
              We have recently redesigned our site and things may have moved. If
              your link didn't work or you are not finding what you are looking
              for please use the search.
            </p>
          </main>
          <Footer />
        </div>
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
