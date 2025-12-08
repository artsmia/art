function isInternetArchivedPage(url) {
  var internetArchiveUrlRegex = new RegExp(
    "/?web/[0-9]+/https://collections.artsmia.org(.*)"
  );
  var isInternetArchivedPage = url && url.match(internetArchiveUrlRegex);
  var pageUrl = isInternetArchivedPage && isInternetArchivedPage[1];

  return pageUrl;
}

module.exports = {
  isInternetArchivedPage,
};
