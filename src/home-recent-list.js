var React = require("react");
var ReactDOM = require("react-dom");
var Router = require("react-router");
var Masonry = require("masonry-layout");
var imagesLoaded = require("imagesloaded");
var debounce = require("debounce");

var ArtworkResult = require("./artwork-result");

function hasValidImage(art) {
  return art.image === "valid" && Number(art.image_width || 0) > 0;
}

var HomeRecentList = React.createClass({
  mixins: [Router.Navigation],

  getInitialState() {
    return {
      columnWidth: 320,
      gutter: 32,
    };
  },

  sanitizeArtworkId(id) {
    return String(id || "").replace("http://api.artsmia.org/objects/", "");
  },

  render() {
    var onImageFailed = this.props.onImageFailed;
    var results = (this.props.artworks || [])
      .filter(hasValidImage)
      .map((art) => {
        var id = this.sanitizeArtworkId(art.id);

        return (
          <div
            key={id}
            onClick={this.handleClick.bind(this, art, id)}
            style={{ width: this.state.columnWidth + "px" }}
          >
            <ArtworkResult
              id={id}
              data={{ artwork: art }}
              onImageError={() => onImageFailed && onImageFailed(art)}
            />
          </div>
        );
      });

    return (
      <div className="home-recent-results-wrap">
        <div className="objects-wrap" ref="objectsWrap">
          {results}
        </div>
      </div>
    );
  },

  componentDidMount() {
    this.handleResize = debounce(this.syncLayoutMetrics, 120);
    window.addEventListener("resize", this.handleResize);
    this.initializeMasonry();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.artworks !== this.props.artworks) {
      this.syncLayoutMetrics();
    }
  },

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    if (this.imagesLoader) this.imagesLoader.off("progress", this.layoutMasonry);
    if (this.masonry) this.masonry.destroy();
    this.imagesLoader = null;
    this.masonry = null;
  },

  initializeMasonry() {
    var container = ReactDOM.findDOMNode(this.refs.objectsWrap);
    if (!container) return;
    var metrics = this.getLayoutMetrics(container.clientWidth || 0);

    this.masonry = new Masonry(container, {
      itemSelector: ".objects-wrap > div",
      columnWidth: metrics.columnWidth,
      gutter: metrics.gutter,
      horizontalOrder: true,
      transitionDuration: "0.22s",
    });

    this.imagesLoader = imagesLoaded(container);
    this.imagesLoader.on("progress", this.layoutMasonry);
    this.syncLayoutMetrics();
  },

  layoutMasonry() {
    if (this.masonry) this.masonry.layout();
  },

  getLayoutMetrics(containerWidth) {
    var gutter = containerWidth <= 700 ? 20 : 32;
    var minColumnWidth = containerWidth <= 700 ? 240 : 260;
    var targetColumnWidth = 320;
    var safeWidth = Math.max(containerWidth, minColumnWidth);
    var columns = Math.max(
      1,
      Math.floor((safeWidth + gutter) / (minColumnWidth + gutter))
    );
    var columnWidth = Math.floor(
      (safeWidth - gutter * (columns - 1)) / columns
    );

    if (columnWidth > targetColumnWidth) {
      columns = Math.max(
        columns,
        Math.round((safeWidth + gutter) / (targetColumnWidth + gutter))
      );
      columnWidth = Math.floor(
        (safeWidth - gutter * (columns - 1)) / columns
      );
    }

    return {
      columnWidth: Math.max(minColumnWidth, columnWidth),
      gutter: gutter,
    };
  },

  syncLayoutMetrics() {
    var container = ReactDOM.findDOMNode(this.refs.objectsWrap);
    if (!container) return;

    var metrics = this.getLayoutMetrics(container.clientWidth || 0);

    if (this.masonry) {
      this.masonry.options.columnWidth = metrics.columnWidth;
      this.masonry.options.gutter = metrics.gutter;
    }

    if (
      this.state.columnWidth !== metrics.columnWidth ||
      this.state.gutter !== metrics.gutter
    ) {
      this.setState(metrics, this.layoutMasonry);
      return;
    }

    this.layoutMasonry();
  },

  handleClick(art, id) {
    if (!art) return;
    this.transitionTo("artwork", { id: id || this.sanitizeArtworkId(art.id) });
  },
});

module.exports = HomeRecentList;
