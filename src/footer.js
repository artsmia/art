var React = require('react')
var  {Link} = require('react-router')

var GlobalFooter =  React.createClass({

  footernav: [
    {navItem: 'Highlights', link:'http://artsmia.org/donate'},
    {navItem: 'Accessions', link:'http://new.artsmia.org/visit/calendar/'},
    {navItem: 'Explore', link:'http://artsmia.org/donate'},
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
  socialnav: [
    {navItem: 'facebook', link:'http://www.facebook.com/artsmia'},
    {navItem: 'flickr', link:'http://www.flickr.com/photos/minneapolisinstituteofarts/'},
    {navItem: 'instagram', link:'http://instagram.com/artsmia'},
    {navItem: 'twitter', link:'http://twitter.com/artsmia'},
    {navItem: 'youtube', link:'http://www.youtube.com/user/artsmia'},
    {navItem: 'tumblr', link:'http://artsmia.tumblr.com/'},
    {navItem: 'vimeo', link:'https://vimeo.com/artsmia/'},
    {navItem: 'contact', link:'http://new.artsmia.org/contact-us/e-mail-us/'}
  ],
  render() {
    return <div className="footer-wrapper" style={{marginTop: '40px'}}>
      <div className="footer_nav mdl-grid">
        <div className="mdl-cell mdl-cell--4">
        <div className="footer-logo">

        </div>
        <p>
          <span className="footer-tag">is mine</span>
        </p>
        <p>
          <strong>Minneapolis Institute of Art</strong><br />
          2400 Third Avenue South<br />Minneapolis, Minnesota 55404<br />

        </p>
        </div>
      <div className="mdl-cell mdl-cell--4">
        <ul>
        {this.departments.map(({navItem, link}) => {
            return <li key={navItem} className="footer-nav_item">
              <a href={link}>{navItem}</a>
            </li>
          })}
        </ul>
      </div>
      <div className="mdl-cell mdl-cell--4">
        <ul>
        {this.footernav.map(({navItem, link}) => {
            return <li key={navItem} className="footer-nav_item">
              <a href={link}>{navItem}</a>
            </li>
          })}
        </ul>
      </div>
      </div>
      <div className="sub_footer mdl-grid">
        <div className="mdl-cell mdl-cell--4">
          <div className="call-link">
            <a href="tel:8886422787">888 642 2787 (Toll Free)</a>
          </div>
        </div>
        <div className="mdl-cell mdl-cell--4 privacy-link">
          <a href="http://new.artsmia.org/about/privacy-policy-and-website-info/">Privacy Policy and Website Info</a>
        </div>
        <div className="mdl-cell mdl-cell--4">
          <div className="social-links">
            <ul>
            {this.socialnav.map(({navItem, link}) => {
                return <li key={navItem} className="social-nav_item">
                  <a className={["icon-mia", navItem].join('')} href={link}></a>
                </li>
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  }

})

module.exports = GlobalFooter
