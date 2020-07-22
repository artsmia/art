function isInternetArchivedPage(url) {
  var internetArchiveUrlRegex = new RegExp("/?web/[0-9]+/http://collections.artsmia.org(.*)")
  var isInternetArchivedPage = url && url.match(internetArchiveUrlRegex)
  var pageUrl = isInternetArchivedPage && isInternetArchivedPage[1]

  return pageUrl
}

module.exports = {
  isInternetArchivedPage
}
