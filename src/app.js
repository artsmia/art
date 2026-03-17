var React = require("react");
var { RouteHandler, Link } = require("react-router");
var Helmet = require("react-helmet");
var debounce = require("debounce");
var { pathSatisfies } = require("ramda");
var cx = require("classnames");

var Footer = require("./footer");
var consoleWelcomeMessage = require("./console-welcome-message");
var Survey = require("./survey");

var surveyStyle = {
  opacity: 0,
  zIndex: -1,
  position: "fixed",
  bottom: "1em",
  right: "1em",
  width: 444,
  maxWidth: "93%",
  maxHeight: "257px",
  height: "456px",
  backgroundColor: "white",
  transition: "max-height 0.15s ease-out, opacity 0.15s ease-out",
  border: "1px solid black",
  overflow: "scroll",
};

const isDev = process.env.NODE_ENV !== "production";

var App = React.createClass({
  render() {
    var logo = this.makeLogo();
    var canonicalURL = "https://collections.artsmia.org" + this.props.path;
    var classes = cx({
      universal: this.props.universal,
      isDev,
      smallViewport: this.isSmallViewport(),
    });

    return (
      <div className={classes}>
        <style type="text/css">{`
          *:focus {
            outline: 1px dotted #212121;
            outline: -webkit-focus-ring-color auto 5px;
          }
        `}</style>
        {!this.state.hideHeader && (
          <header>
            <div className="header-left">
              {logo}
              {this.primaryNav()}
            </div>
            <div className="header-right">
              <button
                type="button"
                className="header-menu-btn"
                aria-label="Menu"
              >
                <span className="material-icons">menu</span>
              </button>
            </div>
          </header>
        )}
        <Helmet
          title="Collection | Minneapolis Institute of Art"
          titleTemplate="%s | Mia"
          link={[{ rel: "canonical", href: canonicalURL }]}
          meta={[
            {
              property: "robots",
              content: this.noIndex() ? "follow,noindex" : "all",
            },
            { property: "og:url", content: canonicalURL },
          ]}
        />
        <div className="main-content">
          <RouteHandler
            {...this.props}
            activateSearch={this.state.activateSearch}
            toggleAppHeader={this.toggleHeader}
          />
          <Footer />
        </div>

        {this.state.disableSurveyPopup || (
          <div
            style={{
              ...surveyStyle,
              ...(this.state.surveySize === "big"
                ? { maxHeight: "456px" }
                : {}),
              ...(this.state.showSurveyPopup
                ? { opacity: 1, zIndex: 99999999 }
                : {}),
            }}
            role="dialog"
            ariaLabelledby="Site visitor survey"
            ariaModal="true"
          >
            <Survey
              params={{ surveyId: "2019-survey" }}
              onOpen={() => this.setState({ showSurveyPopup: true })}
              onClose={() =>
                this.setState({
                  showSurveyPopup: false,
                  disableSurveyPopup: true,
                })
              }
              expand={() => this.setState({ surveySize: "big" })}
              contract={() => this.setState({ surveySize: "small" })}
            />
          </div>
        )}
      </div>
    );
  },

  componentDidMount() {
    (this.debouncedResize = debounce(this.handleResize, 500)),
      window.addEventListener("resize", this.debouncedResize);
    consoleWelcomeMessage();
  },
  componentWillUnmount() {
    window.removeEventListener("resize", this.debouncedResize);
    this.debouncedResize = undefined;
  },
  handleResize: function (e) {
    if (!this.isMounted()) return;
    this.setState({ smallViewport: this.isSmallViewport() });
  },

  isSmallViewport() {
    var { userAgent } = this.props;
    return (
      (userAgent && userAgent.match(/iphone|android/i)) ||
      (window && window.innerWidth <= 600)
    );
  },

  primaryNav() {
    var path = this.props.path || "";
    return (
      <nav className="header-primary-nav" aria-label="Main">
        <Link to="recent" className={path === "/new" ? "is-active" : ""}>
          New to Mia
        </Link>
        <Link to="explore" className={path === "/explore" ? "is-active" : ""}>
          Explore
        </Link>
      </nav>
    );
  },

  toggleHeader() {
    this.setState({ hideHeader: !this.state.hideHeader });
  },

  getChildContext() {
    return {
      universal: this.props.universal,
      smallViewport: this.state.smallViewport,
      clientIp: this.props.clientIp,
    };
  },

  getInitialState() {
    var hasMoreInQueryParams = pathSatisfies(
      (search) => search && search.indexOf("more=") > 0
    );
    window.enteredViaMore = hasMoreInQueryParams(
      ["window", "location", "search"],
      window
    );

    const disableSurveyPopup = true;
    const showSurveyPopup = false; // don't show until survey fetches data and knows if this user has already completed or rejected the survey

    return {
      smallViewport: this.isSmallViewport(),
      enteredViaMore: window.enteredViaMore,
      showSurveyPopup,
      disableSurveyPopup,
    };
  },

  makeLogo() {
    var logo = <div className="logo-container"></div>;
    return <a href="/">{logo}</a>;
  },

  noIndex() {
    return process.env.NODE_ENV !== "production";
  },
});
App.childContextTypes = {
  universal: React.PropTypes.bool,
  smallViewport: React.PropTypes.bool,
  clientIp: React.PropTypes.string,
};

module.exports = App;
