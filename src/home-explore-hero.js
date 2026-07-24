var React = require("react");
var Router = require("react-router");
var { Link } = Router;

var imageCDN = require("./image-cdn");
var searchLanguageMap = require("./search-language");
var exploreArtworks = require("./home-explore-artworks");

var IMAGE_COUNT = exploreArtworks.IMAGE_COUNT;
var AUTO_ADVANCE_MS = 5000;

var HIGHLIGHTS = [
  "whm",
  "nahm",
  "hispanic-heritage",
  "bhm",
  "aampi",
  "pride-month",
  "highlights-of-japanese-art-paintings-and-prints",
  "women-artists-in-the-paintings-collection",
  "highlights-of-the-contemporary-collection",
  "euro-highlights-pre-1800",
  "minnesotan-artists-in-the-contemporary-collection",
  "euro-highlights-1800-1960s",
  "women-in-the-contemporary-collection",
  "chinese-art-highlights",
  "himalayan-south-southeast-asian-and-islamic-art",
  "prints-and-drawings-collection-highlights",
  "paintings-provenance",
  "native-american-highlights",
  "recent-decorative-arts-sculpture-and-textiles-acquisitions",
  "euro-highlights-prints-drawings",
  "african-art-highlights",
  "oceanic-art-highlights",
  "textile-highlights",
  "new",
  "highlights-of-japanese-art-sculpture-and-decorative-art",
  "photography-and-new-media-highlights",
  "decorative-arts-highlights",
  "women-and-lgbtqia-photographers",
  "sculpture-highlights",
  "recent-acquisitions-to-the-paintings-collection",
  "recent-acquisitions-to-the-photography-and-new-media-collection",
  "highlights-of-korean-art",
  "conservation",
];

function shuffleArray(values) {
  var items = values.slice(0);
  for (var index = items.length - 1; index > 0; index--) {
    var swapIndex = Math.floor(Math.random() * (index + 1));
    var temp = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = temp;
  }
  return items;
}

function sanitizeArtworkId(id) {
  return String(id || "").replace("http://api.artsmia.org/objects/", "");
}

function textValue(value) {
  return String(value || "").trim();
}

function wrapIndex(index, length) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

function defaultHighlightLabel(slug) {
  return textValue(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
}

function highlightLabel(slug) {
  return (
    searchLanguageMap('_exists_:"list:' + slug + '"') !==
    '_exists_:"list:' + slug + '"'
      ? searchLanguageMap('_exists_:"list:' + slug + '"')
      : defaultHighlightLabel(slug)
  );
}

function highlightSearchPath(slug) {
  return "/search/_exists_:%22list:" + slug + "%22";
}

function uniqueArtworks(artworks) {
  var seen = {};
  return (artworks || []).filter(function (art) {
    var id = art && art.id;
    if (!id || seen[id] || !exploreArtworks.hasValidImage(art)) return false;
    seen[id] = true;
    return true;
  });
}

function prefetchedArtworks(data) {
  return uniqueArtworks(
    exploreArtworks.getArtworks((data || {}).exploreHero)
  ).slice(0, IMAGE_COUNT);
}

var HomeExploreHero = React.createClass({
  getInitialState() {
    var initialArtworks = prefetchedArtworks(this.props.data);
    var hasPrefetched = initialArtworks.length >= IMAGE_COUNT;

    return {
      highlightOrder: HIGHLIGHTS.slice(),
      activeIndex: 0,
      currentArtworks: hasPrefetched ? initialArtworks : [],
      loading: !hasPrefetched,
      slideDirection: 0,
      previousLabel: null,
      previousArtworks: null,
    };
  },

  componentWillUnmount() {
    clearTimeout(this._animTimer);
    clearTimeout(this._autoTimer);
  },

  scheduleAutoAdvance() {
    clearTimeout(this._autoTimer);
    this._autoTimer = setTimeout(
      function () {
        if (this.state.loading) return;
        this.changeHighlight(1);
      }.bind(this),
      AUTO_ADVANCE_MS
    );
  },

  clearAutoAdvance() {
    clearTimeout(this._autoTimer);
  },

  currentSlug() {
    var order = this.state.highlightOrder || HIGHLIGHTS;
    return order[wrapIndex(this.state.activeIndex, order.length)];
  },

  currentArtworks() {
    var current = uniqueArtworks(this.state.currentArtworks);
    if (current.length >= IMAGE_COUNT) return current.slice(0, IMAGE_COUNT);

    var prefetched = prefetchedArtworks(this.props.data);
    if (prefetched.length >= IMAGE_COUNT) return prefetched;

    return [];
  },

  componentDidMount() {
    if (this.currentArtworks().length < IMAGE_COUNT) {
      this.fetchHighlightArtworks(0, 0);
      return;
    }

    this.setState({ loading: false });
    this.scheduleAutoAdvance();
    this.shuffleHighlightOrder();
  },

  shuffleHighlightOrder() {
    var currentSlug = this.currentSlug();
    var shuffled = shuffleArray(HIGHLIGHTS);
    var nextIndex = shuffled.indexOf(currentSlug);
    if (nextIndex < 0) nextIndex = 0;

    this.setState({
      highlightOrder: shuffled,
      activeIndex: nextIndex,
    });
  },

  fetchHighlightArtworks(index, direction) {
    direction = direction || 0;
    var order = this.state.highlightOrder || HIGHLIGHTS;
    var activeIndex =
      typeof index === "number"
        ? wrapIndex(index, order.length)
        : this.state.activeIndex;
    var slug = order[activeIndex];
    var previousLabel =
      direction !== 0
        ? highlightLabel(order[this.state.activeIndex])
        : null;
    var previousArtworks =
      direction !== 0 ? this.currentArtworks().slice(0, IMAGE_COUNT) : null;

    this.clearAutoAdvance();
    this.setState({ loading: true });

    return exploreArtworks.fetchUniqueArtworksForHighlight(slug).then(
      function (artworks) {
        if (artworks.length < IMAGE_COUNT) {
          this.setState({ loading: false });
          return;
        }

        this.setState({
          activeIndex: activeIndex,
          currentArtworks: artworks,
          loading: false,
          slideDirection: direction,
          previousLabel: previousLabel,
          previousArtworks: previousArtworks,
        });

        this.scheduleAutoAdvance();

        if (direction !== 0) {
          clearTimeout(this._animTimer);
          this._animTimer = setTimeout(
            function () {
              this.setState({
                slideDirection: 0,
                previousLabel: null,
                previousArtworks: null,
              });
            }.bind(this),
            820
          );
        }
      }.bind(this)
    );
  },

  changeHighlight(delta) {
    if (this.state.loading) return;
    var order = this.state.highlightOrder || HIGHLIGHTS;
    var nextIndex = wrapIndex(this.state.activeIndex + delta, order.length);
    this.fetchHighlightArtworks(nextIndex, delta);
  },

  slideAnimationClasses() {
    var direction = this.state.slideDirection;
    if (direction > 0) {
      return {
        exit: "home-explore-hero__slide-layer--exit-up",
        enter: "home-explore-hero__slide-layer--enter-up",
      };
    }
    if (direction < 0) {
      return {
        exit: "home-explore-hero__slide-layer--exit-down",
        enter: "home-explore-hero__slide-layer--enter-down",
      };
    }
    return { exit: "", enter: "" };
  },

  renderHeadingValue(slug) {
    var previousLabel = this.state.previousLabel;
    var anim = this.slideAnimationClasses();
    var searchPath = highlightSearchPath(slug);

    return (
      <span className="home-explore-hero__heading-value-wrap" aria-live="polite">
        {previousLabel ? (
          <span
            className={
              "home-explore-hero__heading-value home-explore-hero__slide-layer " +
              anim.exit
            }
          >
            {previousLabel}
          </span>
        ) : null}
        <a
          href={searchPath}
          className={
            "home-explore-hero__heading-value home-explore-hero__heading-link home-explore-hero__slide-layer " +
            anim.enter
          }
        >
          {highlightLabel(slug)}
        </a>
      </span>
    );
  },

  renderImageCard(art, isMain) {
    if (!art) return null;
    var id = sanitizeArtworkId(art.id);

    return (
      <Link
        className="home-explore-hero__image-card"
        to="artwork"
        params={{ id: id }}
      >
        <img
          src={imageCDN(art, isMain ? 1200 : 800)}
          alt={art.title || ""}
          className="home-explore-hero__image"
        />
      </Link>
    );
  },

  renderImageSlot(art, previousArt, isMain, anim) {
    return (
      <div
        className="home-explore-hero__image-slot"
        key={sanitizeArtworkId(art.id)}
      >
        {previousArt ? (
          <div className={"home-explore-hero__image-layer " + anim.exit}>
            {this.renderImageCard(previousArt, isMain)}
          </div>
        ) : null}
        <div className={"home-explore-hero__image-layer " + anim.enter}>
          {this.renderImageCard(art, isMain)}
        </div>
      </div>
    );
  },

  render() {
    var artworks = this.currentArtworks();
    if (artworks.length < IMAGE_COUNT) return null;

    var slug = this.currentSlug();
    var anim = this.slideAnimationClasses();
    var previousArtworks = this.state.previousArtworks;
    return (
      <section className="home-explore-hero">
        <div className="home-explore-hero__head">
          <h2 className="home-explore-hero__heading home-explore-hero__heading--top">
            <span className="home-explore-hero__heading-label">Explore</span>{" "}
            {this.renderHeadingValue(slug)}
          </h2>
        </div>

        <div className="home-explore-hero__mosaic">
          <div className="home-explore-hero__mosaic-main">
            {this.renderImageSlot(
              artworks[0],
              previousArtworks && previousArtworks[0],
              true,
              anim
            )}
          </div>
          <div className="home-explore-hero__mosaic-grid">
            {artworks.slice(1, IMAGE_COUNT).map(function (art, index) {
              return this.renderImageSlot(
                art,
                previousArtworks && previousArtworks[index + 1],
                false,
                anim
              );
            }, this)}
          </div>
        </div>

        <div className="home-explore-hero__controls">
          <div className="home-explore-hero__nav">
            <button
              className="home-explore-hero__nav-button"
              type="button"
              onClick={this.changeHighlight.bind(this, -1)}
              aria-label="Previous highlight"
            >
              ←
            </button>
            <button
              className="home-explore-hero__nav-button"
              type="button"
              onClick={this.changeHighlight.bind(this, 1)}
              aria-label="Next highlight"
            >
              →
            </button>
          </div>
        </div>
      </section>
    );
  },
});

module.exports = HomeExploreHero;
