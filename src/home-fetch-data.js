var rest = require("rest");
var SEARCH = require("./endpoints").search;

var FILTER_VALUE = encodeURIComponent('"1"');

function fetchSearchEndpoint(path, size) {
  return rest(`${SEARCH}/${path}:${FILTER_VALUE}?size=${size}`).then((r) =>
    JSON.parse(r.entity)
  );
}

module.exports = {
  accessionHighlights: () => fetchSearchEndpoint("highlights", 20),
  searchResults: () => fetchSearchEndpoint("recent", 60),
};
