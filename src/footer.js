var React = require('react')
var  {Link} = require('react-router')

var GlobalFooter =  React.createClass({

  footernav: [
    {navItem: 'Highlights', link:'http://artsmia.org/donate'},
    {navItem: 'Accessions', link:'http://new.artsmia.org/visit/calendar/'},
    {navItem: 'Explore, ', link:'http://artsmia.org/donate'},
    {navItem: 'Purcell-Cutts House', link:'http://artsmia.org/donate'},
    {navItem: 'Provenance Research', link:'http://new.artsmia.org/visit/calendar/'},
    {navItem: 'Deaccessions', link:'http://artsmia.org/donate'},
    {navItem: 'Conservation', link:'http://artsmia.org/donate'},
    {navItem: 'Curators', link:'http://new.artsmia.org/visit/calendar/'}
  ],
  departments: [
    {navItem: 'Art of Africa and the Americas', link: 'departments/art-of-africa-and-the-americas'},
    {navItem: 'Chinese, South and Southeast Asian Art', link: 'departments/chinese-south-and-southeast-asian-art'},
    {navItem: 'Contemporary Art', link: 'departments/contemporary-art'},
    {navItem: 'Decorative Arts, Textiles & Sculpture', link: 'departments/decorative-arts-textiles-and-sculpture'},
    {navItem: 'Japanese and Korean Art', link: 'departments/japanese-and-korean-art'},
    {navItem: 'Paintings', link: 'departments/paintings'},
    {navItem: 'Photography & New Media', link: 'departments/photography-and-new-media'},
    {navItem: 'Prints and Drawings', link: 'departments/prints-and-drawings'},
  ],
  render() {
    return <div className="footer-wrapper">
      <div className="footer_nav mdl-grid">
        <div className="column-1 mdl-cell mdl-cell--4">
          <ul>
            {this.footernav.map(({navItem, link}) => {
              return <li key={navItem} className="footer-nav_item">
                <a href={link}>{navItem}</a>
              </li>
            })}
          </ul>
        </div>
      <div className="column-2 mdl-cell mdl-cell--4">
        <ul>
        {this.departments.map(({navItem, link}) => {
            return <li key={navItem} className="footer-nav_item">
              <a href={link}>{navItem}</a>
            </li>
          })}
        </ul>
      </div>
      <div className="column-3 mdl-cell mdl-cell--4">
        <ul>
        {this.footernav.map(({navItem, link}) => {
            return <li key={navItem} className="footer-nav_item">
              <a href={link}>{navItem}</a>
            </li>
          })}
        </ul>
      </div>
      </div>
    </div>
  }

})

module.exports = GlobalFooter
