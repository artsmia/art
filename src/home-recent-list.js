var React = require("react");
var ReactDOM = require("react-dom");
var Router = require("react-router");
var Masonry = require("masonry-layout");
var imagesLoaded = require("imagesloaded");

var ArtworkResult = require("./artwork-result");

function hasValidImage(art) {
  return art.image === "valid" && Number(art.image_width || 0) > 0;
}

var HomeRecentList = React.createClass({
  mixins: [Router.Navigation],

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
          <div key={id} onClick={this.handleClick.bind(this, art, id)}>
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
    this.initializeMasonry();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.artworks !== this.props.artworks) {
      this.layoutMasonry();
    }
  },

  componentWillUnmount() {
    if (this.imagesLoader) this.imagesLoader.off("progress", this.layoutMasonry);
    if (this.masonry) this.masonry.destroy();
    this.imagesLoader = null;
    this.masonry = null;
  },

  initializeMasonry() {
    var container = ReactDOM.findDOMNode(this.refs.objectsWrap);
    if (!container) return;

    this.masonry = new Masonry(container, {
      itemSelector: ".objects-wrap > div",
      columnWidth: 320,
      gutter: 32,
      isFitWidth: true,
      horizontalOrder: true,
      transitionDuration: "0.22s",
    });

    this.imagesLoader = imagesLoaded(container);
    this.imagesLoader.on("progress", this.layoutMasonry);
    this.layoutMasonry();
  },

  layoutMasonry() {
    if (this.masonry) this.masonry.layout();
  },

  handleClick(art, id) {
    if (!art) return;
    this.transitionTo("artwork", { id: id || this.sanitizeArtworkId(art.id) });
  },
});

module.exports = HomeRecentList;
