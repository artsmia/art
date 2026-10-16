/**
 * Persist content-advisory reveals for the browser tab so search and
 * artwork pages share the same unblur state across client navigations.
 */
var STORAGE_KEY = "mia:advisoryRevealed";

function readMap() {
  if (typeof sessionStorage === "undefined") return {};
  try {
    var raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    var parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeMap(map) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    // Quota / private mode — ignore; in-memory React state still works.
  }
}

function isRevealed(id) {
  if (id == null) return false;
  return !!readMap()[String(id)];
}

function reveal(id) {
  if (id == null) return;
  var key = String(id);
  var map = readMap();
  if (map[key]) return;
  map[key] = true;
  writeMap(map);
}

function getRevealedMap() {
  return readMap();
}

module.exports = {
  isRevealed: isRevealed,
  reveal: reveal,
  getRevealedMap: getRevealedMap,
};
