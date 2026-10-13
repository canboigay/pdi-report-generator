#!/usr/bin/env bash
# Installs dependencies and makes sure a Chromium is available.
set -euo pipefail
cd "$(dirname "$0")/.."
command -v node >/dev/null || { echo "Node.js >= 18 is required"; exit 1; }
npm install --no-audit --no-fund
bash scripts/fonts.sh
if node -e 'process.exit(require("./lib/chrome").findChrome()?0:1)'; then
  echo "Chrome found: $(node -e 'console.log(require("./lib/chrome").findChrome())')"
else
  echo "No Chrome/Chromium found; installing Playwright's Chromium..."
  npx playwright-core install chromium
  node -e 'const c=require("./lib/chrome").findChrome(); if(!c){console.error("Chromium install failed");process.exit(1)} console.log("Chromium: "+c)'
fi
command -v pdffonts >/dev/null || echo "Note: install poppler-utils (pdffonts, pdftoppm) to run the smoke test font check and rasterise pages."
echo "Setup complete. Try: npm run example"
