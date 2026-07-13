#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

npm run catalog
npm run validate
npm run build:site

git -C _site init -b gh-pages
git -C _site add .
if ! git -C _site diff --cached --quiet; then
  VERSION="$(node -p "require('./package.json').version")"
  git -C _site commit -m "deploy Benchmark Atlas ${VERSION}"
fi

if ! git -C _site remote get-url origin >/dev/null 2>&1; then
  git -C _site remote add origin "$(git remote get-url origin)"
fi

git -C _site push --force origin gh-pages
