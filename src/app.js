var React = require('react')
var {RouteHandler, Link} = require('react-router')
var Helmet = require('react-helmet')

var LiveSearch = require('./live-search')

var App = React.createClass({
  render() {
    return (
      <div className={this.props.universal && 'universal'}>
        <header><Link to="home"><div className='logo-container'></div></Link></header>
        <Helmet
          title="Art!"
          titleTemplate="%s ˆ Mia"
          />
        <RouteHandler {...this.props} activateSearch={this.state.activateSearch} />

        {this.searchBar()}
      </div>
    )
  },

  getChildContext() {
    return {
      universal: this.props.universal,
    }
  },

  searchBar() {
    var button = <button className="material-icons search" style={{position: 'absolute', top: '0.5em', right: '0.5em'}} onClick={this.toggleSearch}>
      {this.state.showSearch ? 'close' : 'search'}
    </button>
    var searchTrigger = this.props.universal ? <Link to="home">{button}</Link> : button

    return <div>
      {searchTrigger}
      {this.state.showSearch && <LiveSearch afterSearch={this.toggleSearch} />}
    </div>
  },

  toggleSearch(event, {forceClose}={false}) {
    var {data} = this.props
    this.setState(
      data && data.searchResults && !forceClose ?
        {activateSearch: event.timeStamp} :
        {showSearch: forceClose ? false : !this.state.showSearch}
    )
  },

  getInitialState() {
    return {
      showSearch: false
    }
  },
})
App.childContextTypes = {universal: React.PropTypes.bool}

module.exports = App
