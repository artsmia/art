var React = require("react");
var Helmet = require("react-helmet");
var rest = require("rest");

var SEARCH = require("./endpoints").search;
var DiscoverCarousel = require("./discover-carousel");
var DiscoverHighlights = require("./discover-highlights");
var discoverArtworks = require("./discover-artworks");

var FILTER_VALUE = encodeURIComponent('"1"');

function fetchSearchEndpoint(path, size) {
  return rest(SEARCH + "/" + path + ":" + FILTER_VALUE + "?size=" + size).then(
    function (r) {
      return JSON.parse(r.entity);
    }
  );
}

var Discover = React.createClass({
  statics: {
    fetchData: {
      discoverCarousel: function () {
        return discoverArtworks.fetchUniqueArtworksForHighlight("whm");
      },
      accessionHighlights: function () {
        return fetchSearchEndpoint("highlights", 20);
      },
    },
  },

  render() {
    return (
      <div className="discover-page">
        <h1 className="discover-page__title">Discover Mia's Collection</h1>
        <DiscoverCarousel data={this.props.data} />
        <DiscoverHighlights data={this.props.data} />
        <Helmet title="Discover the art" />
      </div>
    );
  },
});

module.exports = Discover;
