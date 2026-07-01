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
          <div className="header-shell">
            <header className={cx({ open: this.state.menuOpen })}>
              <div className="header-left">
                {logo}
                {this.primaryNav()}
              </div>
              <div className="header-right">
                <button
                  type="button"
                  className="header-menu-btn"
                  aria-label={this.state.menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={this.state.menuOpen}
                  aria-controls="header-expanded-nav"
                  onClick={this.toggleMenu}
                >
                  <span className="material-icons">
                    {this.state.menuOpen ? "close" : "menu"}
                  </span>
                </button>
              </div>
            </header>
            {this.state.menuOpen && this.expandedNav()}
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

  expandedNav() {
    var expandedNavColumns = [
      [
        { label: "Exhibitions", href: "https://new.artsmia.org/exhibitions" },
        { label: "Art + Artists", href: "https://new.artsmia.org/art-artists" },
      ],
      [
        { label: "Programs", href: "https://new.artsmia.org/discover" },
        { label: "About", href: "https://new.artsmia.org/about" },
      ],
      [
        { label: "Shop", href: "https://new.artsmia.org/shop" },
        { label: "Visit", href: "https://new.artsmia.org/visit" },
      ],
    ];

    var utilityLinks = [
      { label: "Tickets", href: "https://tickets.artsmia.org/events" },
      { label: "Calendar", href: "https://new.artsmia.org/visit/calendar" },
      {
        label: "Donate",
        href: "https://tickets.artsmia.org/events?category=Donation",
      },
    ];

    return (
      <div
        id="header-expanded-nav"
        className="header-expanded-nav"
        onClick={this.closeMenu}
      >
        <div className="expanded-nav-section expanded-nav-label-wrap">
          <div className="expanded-nav-label">Explore ArtsMia.org</div>
        </div>
        <div className="expanded-nav-separator" />
        <div className="expanded-nav-section expanded-nav-grid">
          {expandedNavColumns.map((column, columnIndex) => (
            <div className="expanded-nav-column" key={`col-${columnIndex}`}>
              {column.map(({ label, href }) => (
                <a key={label + href} href={href} onClick={this.closeMenu}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="expanded-nav-separator" />
        <div className="expanded-nav-section expanded-nav-utility">
          {utilityLinks.map(({ label, href }) => (
            <a key={label + href} href={href} onClick={this.closeMenu}>
              {label}
            </a>
          ))}
        </div>
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
    var navLinks = [
      { key: "new", label: "New to Mia", to: "recent", activePath: "/new" },
      {
        key: "explore",
        label: "Explore",
        to: "explore",
        activePath: "/explore",
      },
      {
        key: "purcell-cutts-house",
        label: "Purcell-Cutts House",
        to: "page",
        params: { name: "purcell-cutts-house" },
        activePath: "/info/purcell-cutts-house",
      },
      {
        key: "provenance-research",
        label: "Provenance Research",
        to: "page",
        params: { name: "provenance-research" },
        activePath: "/info/provenance-research",
      },
      {
        key: "deaccessions",
        label: "Deaccessions",
        to: "page",
        params: { name: "deaccessions" },
        activePath: "/info/deaccessions",
      },
      {
        key: "conservation",
        label: "Conservation",
        to: "page",
        params: { name: "conservation" },
        activePath: "/info/conservation",
      },
    ];

    return (
      <nav className="header-primary-nav" aria-label="Main">
        {navLinks.map(({ key, label, to, params, activePath }) => {
          return (
            <Link
              key={key}
              to={to}
              params={params}
              className={path === activePath ? "is-active" : ""}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    );
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
