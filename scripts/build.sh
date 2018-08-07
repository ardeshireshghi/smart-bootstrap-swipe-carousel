#!/usr/bin/env bash

set -eo pipefail

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

report() {
  echo "┌──────────────────────────────┐"
  echo "│ Build Finished successfully! │"
  echo "└──────────────────────────────┘"
  echo -e "\\nCreated artifacts: \\n\\n$ARTIFACT\\n$MIN_ARTIFACT\\n"
}

main() {
  dist
  minify
  report
}

main "$@"
