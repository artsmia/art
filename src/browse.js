var React = require("react");
var rest = require("rest");

var Search = require("./search");
var SEARCH = require("./endpoints").search;
var { getResultTotal } = require("./util/search-utils");

var { RESULTS_PAGE_SIZE } = require("./util/pagination-utils");

var BROWSE_QUERY = "image:valid public_access:1";

function fetchBrowseData(size) {
  var q = encodeURIComponent(BROWSE_QUERY);
  var batchSize = size || RESULTS_PAGE_SIZE;
  return Promise.all([
    rest(SEARCH + "/random/art?size=" + batchSize + "&q=" + q).then(function (
      response
    ) {
      return JSON.parse(response.entity);
    }),
    rest(SEARCH + "/" + q + "?size=0").then(function (response) {
      return JSON.parse(response.entity);
    }),
  ]).then(function (results) {
    var hits = results[0];
    var countJson = results[1];
    if (!Array.isArray(hits)) hits = [];
    var total = getResultTotal(countJson) || hits.length;
    return {
      query: "*",
      hits: {
        hits: hits,
        total: total,
      },
    };
  });
}

var Browse = React.createClass({
  statics: {
    fetchData: {
      searchResults: function (params, query) {
        return fetchBrowseData((query && query.size) || RESULTS_PAGE_SIZE);
      },
    },
  },

  render() {
    return <Search {...this.props} blank />;
  },
});

module.exports = Browse;
