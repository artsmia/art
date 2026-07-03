var React = require("react");
var { RouteHandler } = require("react-router");
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

const wordmarkSrc =
  "https://images.artsmia.org/wp-content/uploads/2022/05/16151023/Mia_Isolated_Wordmark_100K.svg";

const MAIN_NAV = [
  { id: "browse", text: "Browse", href: "/browse" },
  { id: "tickets", text: "Tickets", href: "https://tickets.artsmia.org/events" },
  {
    id: "calendar",
    text: "Calendar",
    href: "https://new.artsmia.org/visit/calendar",
  },
  {
    id: "donate",
    text: "Donate",
    href: "https://tickets.artsmia.org/events?category=Donation",
  },
];

const UTILITY_NAV = {
  id: "mia-org",
  text: "artsmia.org",
  href: "https://new.artsmia.org",
  external: true,
};

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
          <div className="header-shell">
            <header>
              <div className="header-row">
                <div className="header-logo-wrap">{logo}</div>
                <div className="header-nav-wrap position-relative">
                  {this.siteNav()}
                  <a
                    href="#"
                    onClick={this.toggleMenu}
                    aria-label="Mobile Navigation"
                    aria-expanded={this.state.menuOpen ? "true" : "false"}
                  >
                    <div
                      id="nav-icon"
                      className={this.state.menuOpen ? "open" : "close"}
                    >
                      <span />
                      <span />
                      <span />
                    </div>
                  </a>
                </div>
              </div>
            </header>
          </div>
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
          {!this.isArtworkPage() && <Footer />}
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

  siteNav() {
    var menuOpen = this.state.menuOpen;
    var search = this.state.search;
    var utility = UTILITY_NAV;

    return (
      <nav className="nav" aria-label="Site Navigation">
        <div className="header-nav-desktop">
          <ul className="header-nav-links uppercase">
            {MAIN_NAV.map(({ id, text, href }) => (
              <li key={id}>
                <a href={href} title={text} aria-label={text}>
                  {text}
                </a>
              </li>
            ))}
            <li>
              <a
                href={utility.href}
                title={utility.text}
                aria-label={utility.text}
                target="_blank"
                rel="noopener noreferrer"
              >
                {utility.text}
                <span className="header-nav-external" aria-hidden="true">
                  {" "}
                  ↗
                </span>
              </a>
            </li>
          </ul>
          <ul className="header-nav-utility uppercase">
            <li className="search" aria-label="Click to Search">
              <form className="search-header" onSubmit={this.handleSearchSubmit}>
                <label className="hidden" htmlFor="header-search">
                  Search
                </label>
                <input
                  type="search"
                  placeholder=""
                  className="search"
                  name="search"
                  id="header-search"
                  aria-label="Search"
                  value={search}
                  onChange={this.handleSearchChange}
                />
              </form>
            </li>
          </ul>
        </div>
        <div
          id="nav-items"
          className={menuOpen ? "open-nav" : "close"}
          aria-label="Mobile Navigation"
          aria-expanded={menuOpen ? "true" : "false"}
        >
          <ul className="header-mobile-links uppercase">
            {MAIN_NAV.map(({ id, text, href }) => (
              <li key={id}>
                <a
                  href={href}
                  title={text}
                  aria-label={text}
                  onClick={this.closeMenu}
                >
                  {text}
                </a>
              </li>
            ))}
            <li>
              <a
                href={utility.href}
                title={utility.text}
                aria-label={utility.text}
                onClick={this.closeMenu}
                target="_blank"
                rel="noopener noreferrer"
              >
                {utility.text}
                <span className="header-nav-external" aria-hidden="true">
                  {" "}
                  ↗
                </span>
              </a>
            </li>
            <li className="search" aria-label="Click to Search">
              <form className="search-header" onSubmit={this.handleSearchSubmit}>
                <label className="hidden" htmlFor="header-search-mobile">
                  Search
                </label>
                <input
                  type="search"
                  placeholder=""
                  className="search non-focus"
                  name="search"
                  id="header-search-mobile"
                  aria-label="Search"
                  value={search}
                  onChange={this.handleSearchChange}
                />
              </form>
            </li>
          </ul>
        </div>
      </nav>
    );
  },

  handleSearchChange(event) {
    this.setState({ search: event.target.value });
  },

  handleSearchSubmit(event) {
    event.preventDefault();
    var query = (this.state.search || "").trim();
    if (!query) return;
    window.location = "/search/" + encodeURIComponent(query);
  },

  toggleHeader() {
    this.setState({ hideHeader: !this.state.hideHeader });
  },

  toggleMenu(event) {
    event && event.preventDefault();
    event && event.stopPropagation();
    this.setState({ menuOpen: !this.state.menuOpen });
  },

  closeMenu() {
    if (!this.state.menuOpen) return;
    this.setState({ menuOpen: false });
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
      menuOpen: false,
      search: "",
      smallViewport: this.isSmallViewport(),
      enteredViaMore: window.enteredViaMore,
      showSurveyPopup,
      disableSurveyPopup,
    };
  },

  makeLogo() {
    return (
      <a href="/" aria-label="back to home">
        <img
          className="header-logo"
          src={wordmarkSrc}
          alt="Minneapolis Institute of Art home"
        />
      </a>
    );
  },

  noIndex() {
    return process.env.NODE_ENV !== "production";
  },

  isArtworkPage() {
    var path = this.props.path || "";
    return /^\/art\//.test(path);
  },
});
App.childContextTypes = {
  universal: React.PropTypes.bool,
  smallViewport: React.PropTypes.bool,
  clientIp: React.PropTypes.string,
};

module.exports = App;
