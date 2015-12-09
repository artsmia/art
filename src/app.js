var React = require('react')
var {RouteHandler, Link} = require('react-router')
var Helmet = require('react-helmet')

var LiveSearch = require('./live-search')
var GlobalNavigation = require('./navigation')

var App = React.createClass({
  render() {
    return (
      <div className={this.props.universal && 'universal'}>
        <header style={{zIndex: this.state.showMenu || this.state.showSearch ? 5 : 1}}>
          <Link to="home"><div className='logo-container'></div></Link>
          {this.globalToolBar()}
        </header>
        <Helmet
          title="Art!"
          titleTemplate="%s ˆ Mia"
          />
        <RouteHandler {...this.props} activateSearch={this.state.activateSearch} />

      </div>
    )
  },

  getChildContext() {
    return {
      universal: this.props.universal,
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
      <div className= {this.state.showMenu ? 'global_buttons_open' : 'global_buttons'}>
        {menuTrigger}
        {searchTrigger}
      </div>
      <div className="global_display">
      {this.state.showMenu && <GlobalNavigation />}
      {this.state.showSearch && <LiveSearch afterSearch={this.toggleSearch} />}
      </div>
    </div>
  },

  toggleSearch(event, {forceClose}={false}) {
    var {data} = this.props
    this.setState(
      data && data.searchResults && !forceClose ?
        {activateSearch: event.timeStamp} :
        {showSearch: forceClose ? false : !this.state.showSearch}
      )
      this.setState({showMenu: false})
  },
  toggleMenu() {
    this.setState({
      showMenu: !this.state.showMenu,
      showSearch: false
    })
  },

  getInitialState() {
    return {
      showSearch: false
    }
  },
})
App.childContextTypes = {universal: React.PropTypes.bool}

module.exports = App
