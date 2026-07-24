var React = require("react");
var Router = require("react-router");
var { Link } = Router;
var Helmet = require("react-helmet");
var rest = require("rest");

var SEARCH = require("./endpoints").search;
var _Artwork = require("./_artwork");
var imageCDN = require("./image-cdn");
var HomeExploreHero = require("./home-explore-hero");
var exploreArtworks = require("./home-explore-artworks");

var INTRO_IMAGE_URL =
  "https://img.artsmia.org/web_objects_cache/127000/000/80/127081/mia_8008778_full.jpg";
var FILTER_VALUE = encodeURIComponent('"1"');

function fetchSearchEndpoint(path, size) {
  return rest(`${SEARCH}/${path}:${FILTER_VALUE}?size=${size}`).then((r) =>
    JSON.parse(r.entity)
  );
}

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

var RecentAccessions = React.createClass({
  getInitialState() {
    return { failedImageIds: {} };
  },

  componentDidMount() {
    document.body.classList.add("ntm-page-active");
  },

  componentWillUnmount() {
    document.body.classList.remove("ntm-page-active");
  },

  markImageFailed(art) {
    var id = this.sanitizeArtworkId(art.id);
    if (!id) return;
    this.setState(function (prev) {
      return { failedImageIds: { ...prev.failedImageIds, [id]: true } };
    });
  },

  statics: {
    fetchData: {
      searchResults: () => fetchSearchEndpoint("recent", 60),
      accessionHighlights: () => fetchSearchEndpoint("highlights", 20),
      exploreHero: () => exploreArtworks.fetchUniqueArtworksForHighlight("whm"),
    },
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

  renderArtworkSummary(art) {
    return (
      <div className="ntm-artwork-text artwork-summary">
        <_Artwork.Title art={art} link={false} />
        <_Artwork.Creator
          art={art}
          wrapper="h2"
          peek={false}
          showPeeks={false}
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
        {this.renderArtworkSummary(art)}
      </Link>
    );
  },

  renderAccessionHighlightsSection() {
    var cards = this.filterByWorkingImages(this.highlightArtworksWithImages()).slice(0, 4);
    return (
      <section className="ntm-highlights-section">
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

  recentResults() {
    return getHits((this.props.data || {}).searchResults);
  },

  recentArtworks() {
    return this.recentResults()
      .map((hit) => hit._source)
      .filter((art) => !!art);
  },

  recentArtworksWithImages() {
    return artworksWithValidImages(this.recentArtworks());
  },

  renderRecentCard(art, index) {
    var id = this.sanitizeArtworkId(art.id);
    return (
      <Link
        className="ntm-recent-item"
        key={id || `recent-${index}`}
        to="artwork"
        params={{ id }}
      >
        <div className="ntm-recent-thumb">
          {this.renderArtworkThumb(art)}
        </div>
        {this.renderArtworkSummary(art)}
      </Link>
    );
  },

  renderRecentAccessionsSection() {
    var cards = this.filterByWorkingImages(this.recentArtworksWithImages()).slice(0, 9);
    return (
      <section className="ntm-recent-section">
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
          {cards.length ? (
            <div className="ntm-recent-list">{cards.map(this.renderRecentCard)}</div>
          ) : (
            <div className="ntm-recent-empty">
              <span className="material-icons">history</span>
              <p className="ntm-recent-empty-title">Check back soon for new accessions</p>
              <p className="ntm-recent-empty-copy">
                We are constantly updating our digital archive.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  },

  getPreloadLinks() {
    var links = [{ rel: "preload", as: "image", href: INTRO_IMAGE_URL }];
    var all = [].concat(
      this.highlightArtworksWithImages().slice(0, 4),
      this.recentArtworksWithImages().slice(0, 9)
    );
    all.forEach(function (art) {
      var url = imageCDN(art, 800);
      if (url) links.push({ rel: "preload", as: "image", href: url });
    });
    return links;
  },

  render() {
    return (
      <div className="new-to-mia">
        <div className="ntm-page-content">
          <section className="ntm-intro-hero">
            <div className="ntm-intro-image">
              <img
                alt=""
                aria-hidden="true"
                className="ntm-intro-image-img"
                src={INTRO_IMAGE_URL}
              />
            </div>
            <div className="ntm-intro-card">
              <h1>New to Mia</h1>
              <p>
                Our collection keeps growing as the world keeps changing. Whether
                it's a masterpiece by a celebrated artist, a contemporary work that
                speaks to our times, or the creation of someone whose talents were
                previously overlooked, Mia collects artworks that reflect the full
                breadth of human creativity.
              </p>
              <a
                className="ntm-intro-link"
                href="https://new.artsmia.org/art-artists/managing-mias-collection"
              >
                Learn more about Mia's collections practice
              </a>
            </div>
          </section>
          <div className="explore-section">
            {this.renderAccessionHighlightsSection()}
            <HomeExploreHero data={this.props.data} />
            {this.renderRecentAccessionsSection()}
          </div>
        </div>
        <Helmet
          title="New to Mia - Acquisition Highlights"
          link={this.getPreloadLinks()}
        />
      </div>
    );
  },
});

module.exports = RecentAccessions;
