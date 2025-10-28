function getResultTotal(result) {
  if (!result || !result.hits || !result.hits.total) {
    return 0;
  }
  const t = result.hits.total;
  if (typeof t === "number") {
    // Old ElasticSearch
    return t;
  }
  if (t.value && typeof t.value === "number") {
    // OpenSearch
    return t.value;
  }
  return 0;
}

module.exports = {
  getResultTotal,
};
