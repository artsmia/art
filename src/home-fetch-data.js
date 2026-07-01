var exploreArtworks = require("./home-explore-artworks");

function fetchSearchEndpoint(path, size) {
  var rest = require("rest");
  var SEARCH = require("./endpoints").search;
  var FILTER_VALUE = encodeURIComponent('"1"');

  return rest(SEARCH + "/" + path + ":" + FILTER_VALUE + "?size=" + size).then(
    function (r) {
      return JSON.parse(r.entity);
    }
  );
}

module.exports = {
  exploreHero: function () {
    return exploreArtworks.fetchUniqueArtworksForHighlight("whm");
  },
  accessionHighlights: function () {
    return fetchSearchEndpoint("highlights", 20);
  },
  searchResults: function () {
    return fetchSearchEndpoint("recent", 60);
  },
};
