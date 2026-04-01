var React = require("react");
var Router = require("react-router");
var splitArray = require("split-array");

var ImageQuilt = require("../image-quilt");

var SearchResultsGrid = React.createClass({
  mixins: [Router.Navigation],

  componentWillMount() {
    this.cachedQuilts = [];
  },

  componentWillReceiveProps(nextProps) {
    var searchChanged =
      this.props.search.query != nextProps.search.query ||
      this.props.search.filters != nextProps.search.filters ||
      this.props.hits.slice(0, 10) !== nextProps.hits.slice(0, 10);

    if (searchChanged) {
      this.cachedQuilts = [];
    }
  },

  render() {
    var { hits, isInspiredByMia } = this.props;
    var targetHeight = hits.length < 20 ? 250 : 150;

    const customImageFn = this.props.customImage;

    const useQuiltCache = !isInspiredByMia;
    console.info("grid render", { isInspiredByMia, useQuiltCache });

    var quilts = splitArray(hits, 50).map((chunkedHits, index) => {
      var chunkedQuilt = (useQuiltCache && this.cachedQuilts[index]) || (
        <ImageQuilt
          artworks={chunkedHits}
          maxRows={1000}
          rowHeight={targetHeight}
          maxRowHeight={500}
          key={index}
          customImageFn={customImageFn}
          isInspiredByMia={isInspiredByMia}
          disableHover={true}
        />
      );

      if (chunkedHits.length >= 50) this.cachedQuilts[index] = chunkedQuilt;
      return chunkedQuilt;
    });

    var dividedQuilts = quilts.map((quilt, index) => {
      var start = index * 50;
      var end = (index + 1) * 50;
      var _key = `range:${start}-${end}`;
      return (
        <div id={_key} key={_key}>
          {quilt}
        </div>
      );
    });
    var more = this.props.postSearch;

    return (
      <div style={{ position: "relative", minHeight: this.props.minHeight }}>
        <div style={{ minHeight: "150vh" }}>
          {dividedQuilts}
          {more}
        </div>
      </div>
    );
  },
});

module.exports = SearchResultsGrid;
