var React = require("react");
var Router = require("react-router");
var { Link } = Router;

var _Artwork = require("./_artwork");
var imageCDN = require("./image-cdn");
var HomeRecentList = require("./home-recent-list");

function getHits(data) {
  var hits = data && data.hits;
  return (hits && hits.hits) || [];
}

function artworksWithValidImages(artworks) {
  return artworks.filter(
    (art) => art.image === "valid" && Number(art.image_width || 0) > 0
  );
}

var IMG_STYLE = { width: "100%", height: "100%", objectFit: "cover" };
var CONTAINER_STYLE = { width: "100%", height: "100%", overflow: "hidden" };
var RECENT_ACCESSIONS_MIN = 3;
var RECENT_ACCESSIONS_MAX = 10;

var HomeNewToMia = React.createClass({
  getInitialState() {
    return { failedImageIds: {} };
  },

  markImageFailed(art) {
    var id = this.sanitizeArtworkId(art.id);
    if (!id) return;
    this.setState(function (prev) {
      return { failedImageIds: { ...prev.failedImageIds, [id]: true } };
    });
  },

  sanitizeArtworkId(id) {
    return String(id || "").replace("http://api.artsmia.org/objects/", "");
  },

  filterByWorkingImages(artworks) {
    return artworks.filter(
      (art) => !this.state.failedImageIds[this.sanitizeArtworkId(art.id)]
    );
  },

  highlightResults() {
    return getHits((this.props.data || {}).accessionHighlights);
  },

  highlightArtworks() {
    return this.highlightResults()
      .map((hit) => hit._source)
      .filter((art) => !!art);
  },

  highlightArtworksWithImages() {
    return artworksWithValidImages(this.highlightArtworks());
  },

  recentResults() {
    return getHits((this.props.data || {}).searchResults);
  },

  recentArtworks() {
    return this.recentResults()
      .map((hit) => hit._source)
      .filter((art) => !!art);
  },

  recentArtworksForSection() {
    return this.filterByWorkingImages(
      artworksWithValidImages(this.recentArtworks())
    ).slice(0, RECENT_ACCESSIONS_MAX);
  },

  renderArtworkThumb(art) {
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

  renderHighlightCard(art, index) {
    var id = this.sanitizeArtworkId(art.id);
    return (
      <Link
        className="ntm-highlight-card"
        key={id || `highlight-${index}`}
        to="accessionHighlight"
        params={{ id: id, slug: _Artwork.slug(art) }}
      >
        <div className="ntm-highlight-thumb">
          {this.renderArtworkThumb(art)}
        </div>
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

  renderAccessionHighlightsSection() {
    var cards = this.filterByWorkingImages(
      this.highlightArtworksWithImages()
    ).slice(0, 4);
    return (
      <section className="ntm-highlights-section" id="new-to-mia">
        <div className="ntm-highlights-head">
          <h2>Accession Highlights</h2>
        </div>
        {cards.length ? (
          <div className="ntm-highlights-with-cards">
            <div className="ntm-highlights-grid">
              {cards.map(this.renderHighlightCard)}
            </div>
            <Link
              className="ntm-highlights-more"
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

  renderRecentAccessionsSection() {
    var artworks = this.recentArtworksForSection();
    if (artworks.length < RECENT_ACCESSIONS_MIN) return null;

    return (
      <section className="ntm-recent-section" id="recent-accessions">
        <div className="ntm-recent-wrap">
          <div className="ntm-recent-intro">
            <h2 className="ntm-recent-heading">Recent Accessions</h2>
            <Link
              className="ntm-recent-cta"
              to="filteredSearchResults"
              params={{ terms: "*", splat: 'recent:"1"' }}
            >
              Explore recent accessions →
            </Link>
          </div>
          <div className="ntm-recent-results">
            <HomeRecentList
              artworks={artworks}
              onImageFailed={this.markImageFailed}
            />
          </div>
        </div>
      </section>
    );
  },

  render() {
    return (
      <div className="home-new-to-mia">
        {this.renderAccessionHighlightsSection()}
        {this.renderRecentAccessionsSection()}
      </div>
    );
  },
});

module.exports = HomeNewToMia;
