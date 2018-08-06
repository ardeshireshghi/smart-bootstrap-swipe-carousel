#!/usr/bin/env bash

set -e

BROWSERIFY="./node_modules/.bin/browserify"
UGLIFY="./node_modules/.bin/uglifyjs"
SOURCE="src/bootstrap-swipe-carousel.js"
ARTIFACT="dist/bootstrap-swipe-carousel.js"
MIN_ARTIFACT="dist/bootstrap-swipe-carousel.min.js"

dist() {
  "$BROWSERIFY" "$SOURCE" -o "$ARTIFACT" -t babelify
}

minify() {
  cat "$ARTIFACT" | "$UGLIFY" > "$MIN_ARTIFACT"
}

main() {
  dist
  minify
}

main "$@"
