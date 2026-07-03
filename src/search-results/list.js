var React = require("react");
var ReactDOM = require("react-dom");
var Router = require("react-router");
var Masonry = require("masonry-layout");
var imagesLoaded = require("imagesloaded");

var ArtworkResult = require("../artwork-result");

var SearchResultsList = React.createClass({
  mixins: [Router.Navigation],

  render() {
    var { smallViewport, customImage } = this.props;

    var results = this.props.hits.map((hit) => {
      var id = String(hit._source.id || "").replace("http://api.artsmia.org/objects/", "");
      return (
        <div key={id} onClick={this.handleClick.bind(this, hit)}>
          <ArtworkResult
            id={id}
            data={{ artwork: hit._source }}
            highlights={hit.highlight}
            showMore={smallViewport}
            customImage={customImage}
          />
        </div>
      );
    });

    return (
      <div
        className="search-results-wrap clearfix"
        style={{ position: "relative", minHeight: this.props.minHeight }}
      >
        <div className="objects-wrap" ref="objectsWrap">
          {results}
        </div>
        {this.props.postSearch && (
          <div className="search-results-post">{this.props.postSearch}</div>
        )}
      </div>
    );
  },

  componentDidMount() {
    this.initializeMasonry();
  },

  componentDidUpdate(prevProps) {
    const hitsChanged = prevProps.hits !== this.props.hits;
    const filterStateChanged = prevProps.filtersOpen !== this.props.filtersOpen;

    if (hitsChanged) {
      this.destroyMasonry();
      if (this.props.hits.length) {
        window.requestAnimationFrame(() => {
          if (this.props.hits.length) {
            this.initializeMasonry();
          }
        });
      }
    } else if (filterStateChanged) {
      this.layoutMasonry();
    }

    if (filterStateChanged) {
      clearTimeout(this.transitionLayoutTimer);
      this.transitionLayoutTimer = setTimeout(() => {
        this.layoutMasonry();
      }, 240);
    }
  },

  componentWillUnmount() {
    clearTimeout(this.transitionLayoutTimer);
    this.destroyMasonry();
  },

  destroyMasonry() {
    if (this.imagesLoader) this.imagesLoader.off("progress", this.layoutMasonry);
    if (this.masonry) this.masonry.destroy();
    this.imagesLoader = null;
    this.masonry = null;

    const container = this.refs.objectsWrap && ReactDOM.findDOMNode(this.refs.objectsWrap);
    if (!container) return;

    container.style.height = "";
    Array.prototype.forEach.call(container.children, function (item) {
      item.style.position = "";
      item.style.left = "";
      item.style.top = "";
      item.style.transform = "";
    });
  },

  initializeMasonry() {
    const container = ReactDOM.findDOMNode(this.refs.objectsWrap);
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

  layoutMasonry: function () {
    if (this.masonry) this.masonry.layout();
  },

  handleClick(hit) {
    if (!hit) return;
    this.transitionTo("artwork", { id: hit._id });
  },
});
SearchResultsList.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
};

module.exports = SearchResultsList;
