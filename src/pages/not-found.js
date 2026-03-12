var React = require("react");
var { Link } = require("react-router");
var { isInternetArchivedPage } = require("../util/archived-page-handler.js");
var Footer = require("../footer");

var ERROR_IMG_SRC = "/images/error.jpg";

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
        <div className={"container"}>
          <Link to="/" className="not-found-wordmark" title="Minneapolis Institute of Art">
            <img
              src="https://mia-styleguide.s3.amazonaws.com/dist/images/mia-wordmark.svg"
              alt="Minneapolis Institute of Art"
            />
          </Link>
          <main id="maincontent">
            <img
              src={ERROR_IMG_SRC}
              alt={
                'a black and white photo of several women standing beside a chainlink fence and a handmade sign which reads "Lost Persons Area"'
              }
            />

            <h1>Sorry! Couldn't find that page.</h1>
            <p>
              We have recently redesigned our site and things may have moved. If your
              link didn't work or you are not finding what you are looking for please
              use the search.
            </p>
          </main>
        </div>

        <Footer />
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
        transition.redirect(redirectUrl);
      }

      callback();
    },
  },
});

module.exports = NotFound;
