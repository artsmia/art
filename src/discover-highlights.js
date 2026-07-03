var React = require("react");
var Router = require("react-router");
var { Link } = Router;

var _Artwork = require("./_artwork");
var imageCDN = require("./image-cdn");

var IMG_STYLE = { width: "100%", height: "100%", objectFit: "cover" };
var CONTAINER_STYLE = { width: "100%", height: "100%", overflow: "hidden" };

function getHits(data) {
  var hits = data && data.hits;
  return (hits && hits.hits) || [];
}

var DiscoverHighlights = React.createClass({
  getInitialState() {
    return { failedImageIds: {} };
  },

  markImageFailed(art) {
    var id = String(art.id || "").replace("http://api.artsmia.org/objects/", "");
    if (!id) return;
    this.setState(function (prev) {
      return { failedImageIds: { ...prev.failedImageIds, [id]: true } };
    });
  },

  cards() {
    return getHits((this.props.data || {}).accessionHighlights)
      .map((hit) => hit._source)
      .filter(
        (art) =>
          art &&
          art.image === "valid" &&
          Number(art.image_width || 0) > 0 &&
          !this.state.failedImageIds[
            String(art.id || "").replace("http://api.artsmia.org/objects/", "")
          ]
      )
      .slice(0, 4);
  },

  renderThumb(art) {
    return (
      <div className="artwork-image" style={CONTAINER_STYLE}>
        <img
          src={imageCDN(art, 800)}
          alt={art.title || ""}
          onError={() => this.markImageFailed(art)}
          style={IMG_STYLE}
        />
      </div>
    );
  },

  renderCard(art, index) {
    var id = String(art.id || "").replace("http://api.artsmia.org/objects/", "");
    return (
      <Link
        className="ntm-highlight-card"
        key={id || "highlight-" + index}
        to="accessionHighlight"
        params={{ id: id, slug: _Artwork.slug(art) }}
      >
        <div className="ntm-highlight-thumb">{this.renderThumb(art)}</div>
        <div className="ntm-highlight-text artwork-summary">
          <_Artwork.Title art={art} link={false} />
          <_Artwork.Creator
            art={art}
            wrapper="h2"
            peek={false}
            showPeeks={false}
          />
        </div>
      </Link>
    );
  },

  render() {
    var cards = this.cards();
    return (
      <section className="ntm-highlights-section">
        <div className="ntm-highlights-head">
          <h2>Accession Highlights</h2>
        </div>
        {cards.length ? (
          <div className="ntm-highlights-with-cards">
            <div className="ntm-highlights-grid">
              {cards.map(this.renderCard)}
            </div>
            <Link
              className="discover-button ntm-highlights-more"
              to="filteredSearchResults"
              params={{ terms: "*", splat: 'highlights:"1"' }}
            >
              All Accession Highlights
            </Link>
          </div>
        ) : (
          <div className="ntm-highlights-empty">
            <span className="material-icons">museum</span>
            <p className="ntm-highlights-empty-title">No highlights yet</p>
            <p className="ntm-highlights-empty-copy">
              Check back soon for our latest additions.
            </p>
          </div>
        )}
      </section>
    );
  },
});

module.exports = DiscoverHighlights;
