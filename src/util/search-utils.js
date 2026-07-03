function getResultTotal(result) {
  if (!result || !result.hits || !result.hits.total) {
    return 0;
  }
  const t = result.hits.total;
  if (typeof t === "number") {
    // Old ElasticSearch
    return t;
  }
  // OpenSearch
  return typeof t.value === "number" ? t.value : 0;
}

function isBrowsePath(props) {
  if (props && props.route && props.route.name === "browse") return true;
  var path = ((props && props.path) || "").split("?")[0].replace(/\/$/, "");
  return path === "/browse";
}

module.exports = {
  getResultTotal,
  isBrowsePath,
};
