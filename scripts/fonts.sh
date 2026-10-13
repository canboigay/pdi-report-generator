#!/usr/bin/env bash
# Downloads the OFL fonts from google/fonts at a pinned commit and verifies their SHA-256.
set -euo pipefail
cd "$(dirname "$0")/../fonts"
B=https://raw.githubusercontent.com/google/fonts/66928797f271fed5ee428544e7229685e2d90127/ofl
get(){ # file url sha
  if [ -f "$1" ] && echo "$3  $1" | sha256sum -c --status; then return; fi
  curl -sfL -o "$1" "$2"
  echo "$3  $1" | sha256sum -c --status || { echo "Checksum mismatch for $1"; rm -f "$1"; exit 1; }
  echo "Downloaded $1"
}
get Outfit-Variable.ttf "$B/outfit/Outfit%5Bwght%5D.ttf" fc7287273e66929776e2ba54f144fe699080bec29f61bf649d70d871468aeade
get IBMPlexMono-Regular.ttf "$B/ibmplexmono/IBMPlexMono-Regular.ttf" 6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46
get IBMPlexMono-Medium.ttf "$B/ibmplexmono/IBMPlexMono-Medium.ttf" a9b4c49bb299e05b5f6c481e7fb5e78943d2793249a0c8874ab574a2d1ea6755
get IBMPlexMono-SemiBold.ttf "$B/ibmplexmono/IBMPlexMono-SemiBold.ttf" d3c38e55c78f5b0f28009fddba4834ec503278936a5986032424c9bd2d23aa46
