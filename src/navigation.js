var React = require('react')
var  {Link} = require('react-router')

//var {main_nav, quick_links, collections_nav} = require('../data/navigation.json')

var GlobalNavigation =  React.createClass({
  mainnav: [
    {navItem:'Exhibitions', link:'http://new.artsmia.org/exhibitions'},
    {navItem: 'Collection', link:'https://collections.artsmia.org/'},
    {navItem: 'Visit', link:'http://new.artsmia.org/visit/'},
    {navItem: 'Discover', link:'http://new.artsmia.org/discover/'},
    {navItem: 'Shop', link:'http://new.artsmia.org/shop/'},
    {navItem: 'Join', link:'http://new.artsmia.org/join-and-invest/'},
    {navItem: 'About', link:'http://new.artsmia.org/about/'}

  ],
  quicknav: [
    {navItem: 'tickets', link:'http://artsmia.org/donate'},
    {navItem: 'calendar', link:'http://new.artsmia.org/visit/calendar/'},
    {navItem: 'donate', link:'http://artsmia.org/donate'}
  ],
  render() {
    return <div className="nav_bar">
    <div className="background-fill"></div>
      <div className="global_nav">
        <ul className="nav_list">
          {this.mainnav.map(({navItem, link}) => {
            return <li key={navItem} className="nav_item">
              <a href={link}>{navItem}</a>
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
  }

})

module.exports = GlobalNavigation
