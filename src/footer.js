var React = require("react");

var Footer = React.createClass({
  render() {
    return (
      <footer className="footer">
        <div className="border-top-3">
          <div className="row thirds">
            <div className="col col-3">
              <p>
                <strong style={{ fontSynthesis: "none" }}>
                  Minneapolis Institute of Art
                </strong>
                <br />
                <a
                  target="_blank"
                  href="https://www.google.com/maps/place/Minneapolis+Institute+of+Art/@44.958564,-93.2763524,17z/data=!3m2!4b1!5s0x52b332b6ad5e0a03:0xdd0a2c85ea0ce050!4m5!3m4!1s0x52b332b1593a494f:0xc52ce3002e7d7ca6!8m2!3d44.958564!4d-93.2741584"
                  className="link-fade-in-brdr"
                  rel="noopener noreferrer"
                >
                  2400 Third Avenue South
                  <br />
                  Minneapolis, Minnesota 55404
                </a>
                <br />
                <a href="tel:1-888-642-2787" className="link-fade-in-brdr">
                  888 642 2787 (Toll Free)
                </a>
                <br />
                <a
                  href="mailto:visit@artsmia.org"
                  className="link-fade-in-brdr"
                >
                  visit@artsmia.org
                </a>
              </p>
            </div>
            <div className="col col-3" />
            <div className="col col-3">
              <ul className="list-inline" aria-label="social media links">
                <li>
                  <a
                    className="link-fade-out icon-miacontact"
                    href="https://new.artsmia.org/contact-us/e-mail-us/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="email us"
                  />
                </li>
                <li>
                  <a
                    className="link-fade-out icon-miainstagram"
                    href="http://instagram.com/artsmia"
                    aria-label="instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mia on Instagram"
                  />
                </li>
                <li>
                  <a
                    className="link-fade-out icon-miafacebook"
                    href="http://www.facebook.com/artsmia"
                    aria-label="facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mia on Facebook"
                  />
                </li>
                <li>
                  <a
                    className="link-fade-out fa-brands fa-tiktok"
                    href="https://www.tiktok.com/@mplsinstart"
                    aria-label="TikTok"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mia on TikTok"
                  />
                </li>
                <li>
                  <a
                    className="link-fade-out fa-brands fa-square-threads"
                    href="https://www.threads.net/@artsmia"
                    aria-label="threads"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mia on Threads"
                  />
                </li>
                <li>
                  <a
                    className="link-fade-out icon-miavimeo"
                    href="https://vimeo.com/artsmia/"
                    aria-label="vimeo"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mia's Vimeo Channel"
                  />
                </li>
                <li>
                  <a
                    className="link-fade-out icon-miayoutube"
                    href="http://www.youtube.com/user/artsmia"
                    aria-label="youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mia's YouTube Channel"
                  />
                </li>
              </ul>
              <div style={{ lineHeight: 0.9 }}>
                <small>
                  The Minneapolis Institute of Art is a tax exempt nonprofit. Tax
                  identification number: 41-0693915
                </small>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  },
});

module.exports = Footer;
