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

module.exports = {
  getResultTotal,
};
