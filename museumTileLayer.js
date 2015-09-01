L.MuseumTileLayer = L.TileLayer.extend({
  options: {
    crs: L.CRS.Simple,
    infinite: false,
    noWrap: true,
    attributionControl: false
  },

  initialize: function(url, options) {
    this.options.crs.wrapLat = this.options.crs.wrapLng =  null
    L.TileLayer.prototype.initialize.call(this, url, options)

    this._computeImageAndGridSize()
    this.on('tileload', this._adjustNonSquareTile)
  },

  _computeImageAndGridSize: function () { // thanks https://github.com/turban/Leaflet.Zoomify
    var options = this.options,
      imageSize = L.point(options.width, options.height),
      tileSize = options.tileSize || 256

    this._imageSize = [imageSize];
    this._gridSize = [this._getGridSize(imageSize)];

    while (parseInt(imageSize.x) > tileSize || parseInt(imageSize.y) > tileSize) {
      imageSize = imageSize.divideBy(2).floor();
      this._imageSize.push(imageSize);
      this._gridSize.push(this._getGridSize(imageSize));
    }

    this._imageSize.reverse();
    this._gridSize.reverse();

    this.options.maxZoom = this.options.maxNativeZoom = this._gridSize.length - 1;
  },

	_getGridSize: function (imageSize) {
		var tileSize = this.options.tileSize;
		return L.point(Math.ceil(imageSize.x / tileSize), Math.ceil(imageSize.y / tileSize));
	},

  _adjustNonSquareTile: function (data) {
    var tile = data.tile
    var pad = 0.5
    tile.style.width = tile.naturalWidth + pad + 'px'
    tile.style.height = tile.naturalHeight + pad +'px'
  },

  _isValidTile: function(coords) {
    return (coords.x == 0 && coords.y == 0 && coords.z == 0) ||
      coords.x >= 0 && coords.y >= 0 && coords.z > 0 &&
      L.TileLayer.prototype._isValidTile.call(this, coords)
  },

  onAdd: function (map) {
    this.adjustAttribution()

		L.TileLayer.prototype.onAdd.call(this, map);
    this.fitImage()

    if(window.location.href.match(/localhost|debug/)) { // DEBUG
      window.image = this
      window.map = this._map
    }
  },

  _getImageBounds: function () {
    var map = this._map
      , options = this.options
      , nw = map.unproject([0, 0], map.getMaxZoom())
      , se = map.unproject([options.width, options.height], map.getMaxZoom())

    return L.latLngBounds(nw, se)
  },

  fitImage: function () {
    var map = this._map
      , bounds = this._getImageBounds()

    this.options.bounds = bounds // used by `GridLayer.js#_isValidTile`
    map.setMaxBounds(bounds)

    this.fitBoundsExactly()
    if(this.options.fill) this.fillContainer()
  },

  // Determine the minimum zoom to fit the entire image exactly into
  // the container. Set that as the minZoom of the map.
  //
  // If the image is 'wider'[1] than its container, it's zoom is set based on the
  // ratio of the image's width to the container's width. For taller images, height
  // is compared.
  //
  // Two zooms are computed here: 'fit' and 'fill'. Fit is the default, it fits an
  // entire image into the available container. Fill fills the container with a
  // zoomed portion of the image. These two zooms are stored in `this.options.zooms`
  fitBoundsExactly: function() {
    var map = this._map, i, c
      , imageSize = i = this._imageSize.reverse()[0]
      , containerSize = c =  map.getSize()

    var iAR, cAR
      , imageAspectRatio = iAR = imageSize.x/imageSize.y
      , containerAspectRatio = cAR = containerSize.x/containerSize.y
      , imageDimensions = ['container is', cAR <= 1, 'image is', iAR <= 1].join(' ').replace(/true/g, 'tall').replace(/false/g, 'wide')
      , zooms = this.options.zooms = iAR < cAR ?
          {fit: c.y/i.y, fill: c.x/i.x} :
          {fit: c.x/i.x, fill: c.y/i.y}

    var zoom = this.options.minZoom = map.getScaleZoom(zooms.fit, map.getMaxZoom())
    map._addZoomLimit(this)
    map.setZoom(zoom)
  },

  fillContainer: function() {
    var map = this._map

    map.setZoom(map.getScaleZoom(this.options.zooms.fill, map.getMaxZoom()))
  },

  // Remove the 'Leaflet' attribution from the map.
  // With no `attribution` option, remove `attributionControl` all together.
  adjustAttribution: function() {
    L.Control.Attribution.prototype.options.prefix = false

    if(!this.options.attribution) {
      this._map.options.attributionControl = false
      this._map.attributionControl.remove()
    }
  },
})

L.museumTileLayer = function (url, options) {
	return new L.MuseumTileLayer(url, options);
};
