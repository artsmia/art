#!/usr/bin/env bash

# Handle stdin from watchify and send to stdout

# Allow overriding origin by env var
SEARCH_ORIGIN="${SEARCH_ORIGIN:-https://search.artsmia.org/}"

# Remove trailing slash
SEARCH_ORIGIN="${SEARCH_ORIGIN%/}"

sed "s|<SEARCH_ORIGIN>|${SEARCH_ORIGIN}|g"
