#!/usr/bin/env bash
# Publishes frontend/dist/ to the gh-pages branch via a clean orphan commit.
#
# We don't use the `gh-pages` npm package here: it reuses a cached local
# clone across runs and its default `remove` option ('.') never actually
# cleans stale branch content, so a `.gitignore` with an unanchored
# `node_modules/` rule ended up committed to the branch once and then
# silently excluded assets/node_modules/** (icon fonts, images) from every
# subsequent deploy, forever, with no error. A fresh orphan branch each
# deploy sidesteps all of that.
set -euo pipefail

cd "$(dirname "$0")/.."  # frontend/

DIST_DIR="dist"
BRANCH="gh-pages"
REMOTE_URL=$(git -C .. remote get-url origin)
WORKTREE=$(mktemp -d)

if [ ! -d "$DIST_DIR" ]; then
  echo "error: $DIST_DIR does not exist — run npm run build:web first" >&2
  exit 1
fi

cp -r "$DIST_DIR/." "$WORKTREE/"

pushd "$WORKTREE" > /dev/null
git init -q
git checkout -q --orphan "$BRANCH"
git add -A
git commit -q -m "Deploy web build ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
git remote add origin "$REMOTE_URL"
git push -f origin "$BRANCH"
popd > /dev/null

rm -rf "$WORKTREE"
echo "Deployed to $BRANCH."
