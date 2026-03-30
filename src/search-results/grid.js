var React = require("react");
var Router = require("react-router");
var splitArray = require("split-array");

var SearchImageQuilt = require("./search-image-quilt");

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
    var { hits } = this.props;
    var batchSize = 48;

    const customImageFn = this.props.customImage;

    var quilts = splitArray(hits, batchSize).map((chunkedHits, index) => {
      var chunkedQuilt = this.cachedQuilts[index] || (
        <SearchImageQuilt
          artworks={chunkedHits}
          key={index}
          customImageFn={customImageFn}
        />
      );

      if (chunkedHits.length >= batchSize) this.cachedQuilts[index] = chunkedQuilt;
      return chunkedQuilt;
    });

    var dividedQuilts = quilts.map((quilt, index) => {
      var start = index * batchSize;
      var end = (index + 1) * batchSize;
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
