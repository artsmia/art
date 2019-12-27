var React = require('react')
var  {Link} = require('react-router')

//var {main_nav, quick_links, collections_nav} = require('../data/navigation.json')

var GlobalNavigation =  React.createClass({
  mainnav: [
    {navItem:'Exhibitions', link:'https://new.artsmia.org/exhibitions'},
    {navItem: 'Collection', link:'httpss://collections.artsmia.org/'},
    {navItem: 'Visit', link:'https://new.artsmia.org/visit/'},
    {navItem: 'Discover', link:'https://new.artsmia.org/discover/'},
    {navItem: 'Shop', link:'https://new.artsmia.org/shop/'},
    {navItem: 'Join', link:'https://new.artsmia.org/join-and-invest/'},
    {navItem: 'About', link:'https://new.artsmia.org/about/'}

  ],
  quicknav: [
    {navItem: 'tickets', link:'https://artsmia.org/donate'},
    {navItem: 'calendar', link:'https://new.artsmia.org/visit/calendar/'},
    {navItem: 'donate', link:'https://artsmia.org/donate'}
  ],
  render() {

    var {smallViewport} = this.context
    var smallViewport = window && window.innerWidth <= 780

      if(smallViewport){
        return (
          <nav role="navigation" className='mobile-nav nav_bar' onClick={this.closeNav}>

            <div className="global_nav">
              <ul className="nav_list">
                {this.mainnav.map(({navItem, link}) => {
                  return <li key={navItem} className="nav_item">
                    {navItem == 'Collection' ?
                      <Link to="/">Collection</Link> :
                      <a href={link}>{navItem}</a>}
                  </li>
                })}
              </ul>
            </div>
            <div className="quick_nav">
              <ul className="nav_list">
              {this.quicknav.map(({navItem, link}) => {
                  return <li key={navItem} className={[navItem, "button nav_item"].join(' ')}>
                    <a href={link}>{navItem}</a>
                  </li>
                })}
              </ul>
            </div>
          </nav>
        )
      } else {
        return (
          <div className="nav_bar" onClick={this.closeNav}>
      <div className="global_nav">
        <ul className="nav_list">
          {this.mainnav.map(({navItem, link}) => {
            return <li key={navItem} className="nav_item">
              {navItem == 'Collection' ?
                <Link to="/">Collection</Link> :
                <a href={link}>{navItem}</a>}
            </li>
          })}
        </ul>
      </div>
      <div className="quick_nav">
        <ul className="nav_list">
        {this.quicknav.map(({navItem, link}) => {
            return <li key={navItem} className={[navItem, "button nav_item"].join(' ')}>
              <a href={link}>{navItem}</a>
            </li>
          })}
        </ul>
      </div>
    </div>
  )}
},

  closeNav() {
    this.props.closeNav && this.props.closeNav()
  }
})
GlobalNavigation.contextTypes = {
  smallViewport: React.PropTypes.bool,
}

module.exports = GlobalNavigation
