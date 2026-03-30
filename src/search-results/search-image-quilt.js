var React = require("react");
var { Link } = require("react-router");
var PureRenderMixin = require("react-addons-pure-render-mixin");
var ReactDOM = require("react-dom");
var debounce = require("debounce");

var Image = require("../image");

// Cell size and gaps from container width and props
function computeSearchQuiltLayout(containerWidth, props) {
  var fixedColumns = Number(props.fixedColumns || 4);
  var cardGap = props.cardGap || 0;
  var rowGap = props.rowGap == null ? cardGap : props.rowGap;
  var cellAspectRatio =
    props.cellAspectRatio != null ? props.cellAspectRatio : 1;
  var effectiveRowWidth = props.maxRowWidth
    ? Math.min(containerWidth, props.maxRowWidth)
    : containerWidth;
  var rowGapTotal = cardGap * Math.max(0, fixedColumns - 1);
  var rowWidthAvailable = Math.max(0, effectiveRowWidth - rowGapTotal);
  var cellWidth = rowWidthAvailable / Math.max(1, fixedColumns);
  var cellHeight = cellWidth / cellAspectRatio;

  return {
    fixedColumns: fixedColumns,
    cardGap: cardGap,
    rowGap: rowGap,
    cellAspectRatio: cellAspectRatio,
    cellWidth: cellWidth,
    cellHeight: cellHeight,
  };
}

// One cell: image link, then metadata (title links to artwork; artist/date are plain text).
var SearchQuiltPatch = React.createClass({
  render() {
    var {
      art,
      width,
      height,
      customImageFn,
      showMetadata,
      onImageInvalidation,
      lazyLoad,
    } = this.props;

    // width/height are computed px from the parent row layout.
    var cardStyle = {
      width: width,
      overflow: "hidden",
    };

    var imageBoxStyle = {
      width: "100%",
      height: height,
    };

    // Display strings from API as-is (no client-side trimming/stripping).
    var title = art.title_short || art.title || "";
    var artist = art.artist_display || art.artist || "";
    var dated = art.dated || art.date_display || art.accessionDate || "";

    // Max-based size + contain (search.scss) keeps art centered; avoids a “tall stage” of empty gray.
    var image = (
      <Image
        art={art}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
        }}
        customImage={customImageFn}
        lazyLoad={lazyLoad}
        onImageInvalidation={onImageInvalidation}
      />
    );

    var patch = (
      <div className="quilt-patch-image" style={imageBoxStyle} title={title}>
        {image}
      </div>
    );

    return (
      <div className="quilt-patch-card" style={cardStyle}>
        <Link
          className="quilt-patch-card__link"
          to="artwork"
          params={{ id: art.id }}
        >
          {patch}
        </Link>
        {showMetadata && (
          <div className="quilt-patch-meta">
            <Link
              className="quilt-patch-title"
              to="artwork"
              params={{ id: art.id }}
            >
              {title}
            </Link>
            <p className="quilt-patch-artist">{artist}</p>
            <p className="quilt-patch-dated">{dated}</p>
          </div>
        )}
      </div>
    );
  },
});

var SearchQuiltPlaceholder = React.createClass({
  render() {
    var { width, height } = this.props;

    return (
      <div
        aria-hidden="true"
        className="quilt-patch-card quilt-patch-card--placeholder"
        style={{
          width: width,
          height: height,
          visibility: "hidden",
        }}
      />
    );
  },
});

var SearchImageQuilt = React.createClass({
  mixins: [PureRenderMixin],

  // Tracked width drives cell pixel size; debounced listener must match removeEventListener ref.
  getInitialState() {
    return {
      width: window.innerWidth || (this.context.universal && 1000),
    };
  },

  handleResize: function () {
    if (!this.isMounted()) return;
    this.setState({ width: ReactDOM.findDOMNode(this).clientWidth });
  },

  componentDidMount: function () {
    this.handleResize();
    // Store the debounced fn so unmount removes the same listener reference.
    this._debouncedResize = debounce(this.handleResize, 200);
    window.addEventListener("resize", this._debouncedResize);
  },

  componentWillUnmount: function () {
    if (this._debouncedResize) {
      window.removeEventListener("resize", this._debouncedResize);
    }
  },

  render() {
    // Data prep and layout vars first; then rows, then JSX.
    var artworks = this.props.artworks;
    var layout = computeSearchQuiltLayout(this.state.width, this.props);
    var fixedColumns = layout.fixedColumns;
    var cardGap = layout.cardGap;
    var rowGap = layout.rowGap;
    var cellWidth = layout.cellWidth;
    var cellHeight = layout.cellHeight;
    var wrapStyle = {
      "--quilt-card-gap": cardGap ? cardGap + "px" : "0px",
      "--quilt-row-gap": rowGap ? rowGap + "px" : "0px",
      ...this.props.style,
    };
    // Chunk flat hits into rows of fixedColumns for flex rows.
    var rows = artworks.reduce(function (allRows, artwork, index) {
      var rowIndex = Math.floor(index / fixedColumns);
      allRows[rowIndex] = allRows[rowIndex] || [];
      allRows[rowIndex].push(artwork);
      return allRows;
    }, []);
    var forceUpdate = this.forceUpdate.bind(this);
    // One .quilt-row-wrap per row; gaps come from CSS variables on .quilt-wrap.
    var images = rows.map(
      function (row, index) {
        var rowItems = row.slice();
        while (rowItems.length < fixedColumns) rowItems.push(null);

        var rowImages = rowItems.map(function (art, itemIndex) {
          if (!art) {
            return (
              <SearchQuiltPlaceholder
                key={"placeholder" + index + ":" + itemIndex}
                width={cellWidth}
                height={cellHeight}
              />
            );
          }

          var src = art._source;

          return (
            <SearchQuiltPatch
              art={src}
              width={cellWidth}
              height={cellHeight}
              onImageInvalidation={forceUpdate}
              key={src.id}
              customImageFn={this.props.customImageFn}
              lazyLoad={this.props.lazyLoad}
              showMetadata={this.props.showMetadata}
            />
          );
        }, this);

        return (
          <div className="quilt-row-wrap" key={"row" + index}>
            {rowImages}
          </div>
        );
      }.bind(this)
    );

    return (
      <div className="quilt-wrap" style={wrapStyle}>
        {images}
      </div>
    );
  },

  // Sensible defaults for the search grid when parent does not override.
  getDefaultProps() {
    return {
      lazyLoad: false,
      fixedColumns: 4,
      // Higher ratio => shorter frame (cellHeight = cellWidth / ratio). Tight gallery row, not a tall box.
      cellAspectRatio: 1.12,
      cardGap: 48,
      rowGap: 48,
      showMetadata: true,
    };
  },
});

SearchImageQuilt.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
};

module.exports = SearchImageQuilt;
  
