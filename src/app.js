var React = require('react')
var {RouteHandler, Link} = require('react-router')
var Helmet = require('react-helmet')
var debounce = require('debounce')
var {pathSatisfies} = require('ramda')

var LiveSearch = require('./live-search')
var GlobalNavigation = require('./navigation')
var consoleWelcomeMessage = require('./console-welcome-message')
var SkipToMainContentLink = require('./skip-to-main-content-link');


var App = React.createClass({
  render() {
    var logo = this.makeLogo()
    var  path = this.props.path
    var canonicalURL = "https://collections.artsmia.org" + path

    return (
      <div className={this.props.universal && 'universal'}>
        <SkipToMainContentLink path={path} />
        {this.state.hideHeader || <header style={{ zIndex: this.state.showMenu || this.state.showSearch ? 5 : 1 }}>
          {logo}
          {this.globalToolBar()}
        </header>}
        <Helmet
          title="Collection | Minneapolis Institute of Art"
          titleTemplate="%s | Mia"
          link={[
            {"rel": "canonical", "href": canonicalURL},
          ]}
          meta={[
            {property: "robots", content: this.noIndex() ? 'follow,noindex' : 'all'},
            {property: "og:url", content: canonicalURL},
          ]}
          />
        <RouteHandler
          {...this.props}
          activateSearch={this.state.activateSearch}
          toggleAppHeader={this.toggleHeader}
          />
      </div>
    )
  },

  componentDidMount() {
    this.debouncedResize = debounce(this.handleResize, 500),
    window.addEventListener('resize', this.debouncedResize)
    consoleWelcomeMessage()
  },
  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResize)
    this.debouncedResize = undefined
  },
  handleResize: function(e) {
    if(!this.isMounted()) return
    this.setState({smallViewport: this.isSmallViewport()})
  },

  isSmallViewport() {
    var {userAgent} = this.props
    return userAgent && userAgent.match(/iphone|android/i) || window && window.innerWidth <= 600
  },

  toggleHeader() {
    this.setState({hideHeader: !this.state.hideHeader})
  },

  getChildContext() {
    return {
      universal: this.props.universal,
      smallViewport: this.state.smallViewport,
      clientIp: this.props.clientIp,
    }
  },

  globalToolBar() {
    var searchButton = <button className="material-icons search" onClick={this.toggleSearch}>
      {this.state.showSearch ? 'close' : 'search'}
    </button>
    var searchTrigger = this.props.universal ? <Link to="home">{searchButton}</Link> : searchButton
    var menuButton = <button className="material-icons menu" onClick={this.toggleMenu}>
      {this.state.showMenu ? 'close' : 'menu'}
    </button>
    var menuTrigger = menuButton
    return <div>
      <div className="global_buttons">
        {menuTrigger}
        {searchTrigger}
      </div>
      <div className="global_display">
      {this.state.showMenu && <GlobalNavigation closeNav={this.toggleMenu} />}
      {this.state.showSearch && <LiveSearch afterSearch={this.toggleSearch} />}
      </div>
    </div>
  },

  toggleSearch(event, args) {
    var {forceClose} = event || {}
    var {data} = this.props
    this.setState(
      data && data.searchResults && !forceClose ?
        {activateSearch: event.timeStamp} :
        {showSearch: forceClose ? false : !this.state.showSearch}
      )
      this.setState({showMenu: false})
  },
  toggleMenu(event) {
    this.setState({
      showMenu: !this.state.showMenu,
      showSearch: false
    })

    event && event.preventDefault()
  },

  getInitialState() {
    var hasMoreInQueryParams = pathSatisfies(search => search && search.indexOf('more=') > 0)
    window.enteredViaMore = hasMoreInQueryParams(['window', 'location', 'search'], window)

    return {
      showSearch: false,
      smallViewport: this.isSmallViewport(),
      enteredViaMore: window.enteredViaMore,
    }
  },

  // wrap in a click handler when the navigation isn't visible, and open the nav
  // once nav is open, a second click goes to artsmia.org
  makeLogo() {
    var {showMenu} = this.state
    var logo = <div className='logo-container'></div>

    if(this.props.universal) return <a href="/">{logo}</a>

    return showMenu ?
      <a href="https://new.artsmia.org" title="Back to artsmia.org">{logo}</a> :
      <a href="/" onClick={this.toggleMenu} aria-label="Show Menu" title="Show Menu">{logo}</a>
  },

  noIndex() {
    return process.env.NODE_ENV !== 'production'
  },
})
App.childContextTypes = {
  universal: React.PropTypes.bool,
  smallViewport: React.PropTypes.bool,
  clientIp: React.PropTypes.string,
}

module.exports = App
