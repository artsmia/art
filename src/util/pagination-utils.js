var RESULTS_PAGE_SIZE = 100;

function pageRange(start, end) {
  var pages = [];
  for (var i = start; i <= end; i++) pages.push(i);
  return pages;
}

function getPaginationItems(current, total) {
  var sibling = 2;
  if (total <= 7) return pageRange(1, total);

  var left = Math.max(2, current - sibling);
  var right = Math.min(total - 1, current + sibling);
  var items = [1];

  if (left > 2) items.push("ellipsis");
  else left = 2;

  items = items.concat(pageRange(left, right));

  if (right < total - 1) items.push("ellipsis");
  if (items[items.length - 1] !== total) items.push(total);

  return items;
}

function currentPageFromQuery(query) {
  var page = parseInt((query && query.page) || 1, 10);
  return isNaN(page) || page < 1 ? 1 : page;
}

function totalPagesFromCount(total, pageSize, maxResults) {
  if (!total) return 1;
  var capped = Math.min(total, maxResults || total);
  return Math.max(1, Math.ceil(capped / pageSize));
}

module.exports = {
  RESULTS_PAGE_SIZE,
  pageRange,
  getPaginationItems,
  currentPageFromQuery,
  totalPagesFromCount,
};
