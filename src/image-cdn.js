function imageForCollections(art, size = 800) {
  var baseUrl = 'https://img.artsmia.org/web_objects_cache/';

  // Clean up Cache_Location for URL
if (!art.Cache_Location || !art.Primary_RenditionNumber) return null;

var path = art.Cache_Location.replace(/\\/g, '/');
  // Remove ".jpg" from Primary_RenditionNumber
  var fileBase = art.Primary_RenditionNumber.replace(/\.jpg$/i, '');

  // Determine filename based on size
  var sizeSuffix = size === 'full' ? 'full' : (size > 400 ? '800' : '400');

  return `${baseUrl}${path}/${fileBase}_${sizeSuffix}.jpg`;
}

module.exports = imageForCollections;
