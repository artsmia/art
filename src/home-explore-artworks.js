var rest = require("rest");

var SEARCH = require("./endpoints").search;

var IMAGE_COUNT = 5;
var MAX_FETCH_ATTEMPTS = 20;

function getArtworks(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.reduce(function (all, item) {
      return all.concat(getArtworks(item));
    }, []);
  }
  if (data.artwork) return [data.artwork];
  if (data.hits && data.hits.hits) {
    return data.hits.hits.map(function (hit) {
      return hit._source;
    }).filter(Boolean);
  }
  if (data.id) return [data];
  return [];
}

function hasValidImage(art) {
  return (
    art &&
    art.image === "valid" &&
    Number(art.image_width || 0) > 0 &&
    Number(art.image_height || 0) > 0
  );
}

function highlightQuery(slug) {
  return encodeURIComponent(
    'image:valid public_access:1 _exists_:"list:' + slug + '"'
  );
}

function fetchOneRandomArt(query) {
  return rest(SEARCH + "/random/art?q=" + query)
    .then(function (response) {
      return JSON.parse(response.entity);
    })
    .catch(function () {
      return null;
    });
}

function fetchUniqueArtworksForHighlight(slug) {
  var query = highlightQuery(slug);
  var seen = {};
  var artworks = [];
  var attempts = 0;

  function collect(payload) {
    getArtworks(payload).forEach(function (art) {
      var id = art && art.id;
      if (!id || seen[id] || !hasValidImage(art)) return;
      seen[id] = true;
      artworks.push(art);
    });
  }

  function nextBatch() {
    if (artworks.length >= IMAGE_COUNT || attempts >= MAX_FETCH_ATTEMPTS) {
      return Promise.resolve(artworks.slice(0, IMAGE_COUNT));
    }

    var batchSize = Math.min(IMAGE_COUNT, MAX_FETCH_ATTEMPTS - attempts);
    attempts += batchSize;

    return Promise.all(
      Array.from({ length: batchSize }).map(function () {
        return fetchOneRandomArt(query);
      })
    ).then(function (payloads) {
      payloads.forEach(collect);
      return nextBatch();
    });
  }

  return nextBatch();
}

module.exports = {
  IMAGE_COUNT: IMAGE_COUNT,
  getArtworks: getArtworks,
  hasValidImage: hasValidImage,
  highlightQuery: highlightQuery,
  fetchUniqueArtworksForHighlight: fetchUniqueArtworksForHighlight,
};
