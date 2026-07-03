var React = require("react");
var Helmet = require("react-helmet");

var DiscoverCarousel = require("./discover-carousel");
var discoverArtworks = require("./discover-artworks");

var Discover = React.createClass({
  statics: {
    fetchData: {
      discoverCarousel: function () {
        return discoverArtworks.fetchUniqueArtworksForHighlight("whm");
      },
    },
  },

  render() {
    return (
      <div className="discover-page">
        <h1 className="discover-page__title">Discover Mia's Collection</h1>
        <DiscoverCarousel data={this.props.data} />
        <Helmet title="Discover the art" />
      </div>
    );
  },
});

module.exports = Discover;
