#!/usr/bin/env bash

# Allow overriding origin by env var
SEARCH_ORIGIN="${SEARCH_ORIGIN:-https://search.artsmia.org/}"

# Remove trailing slash
SEARCH_ORIGIN="${SEARCH_ORIGIN%/}"

# Build bundle.js
NODE_ENV=production browserify index.js \
  | uglifyjs -c -m \
  | sed "s|\<SEARCH_ORIGIN>|${SEARCH_ORIGIN}|g" \
  > bundle.js
