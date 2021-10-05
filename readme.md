This is the code behind [Mia's collection website](http://collections.artsmia.org).

# Required Software to run sass
Install: sassc -lm sass/main.scss css/main.css
Install: npm install -g rewatch
Run when you npm start for code to watch for changes: npm run watchSass
# Usage

To start the server locally, you (1) need passing familiarity with
`node`. (2) `npm install` to download all this project's dependencies.
(3) `npm start` should start the webserver and begin to update the
javascript bundle.

To compile the sass, install `libsass` and `sassc` (`brew install sassc`) and run `sassc -lm sass/main.scss css/main.css`

# Companion code

It pulls information from many different places:

* [collection-elasticsearch](https://github.com/artsmia/collection-elasticsearch) manages indexing and searching with ElasticSearch
* [collection-info](https://github.com/artsmia/collection-info) hosts editable text for many of the pages on this site
* [collection-links](https://github.com/artsmia/collection-links) connects artworks with related content (audio, blog posts, …)
* [artwork-dimensions](https://github.com/artsmia/artwork-dimensions)
  parses the dimension data for an artwork and builds a graphic referencing the size of a tennis ball.
* [museumTileLayer](https://github.com/kjell/museumTileLayer)
  adds a few features to [Leaflet](https://github.com/Leaflet/Leaflet) to display high-resolution photography
