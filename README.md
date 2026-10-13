# PDI report generator

Turns a JSON file of Private Digital Investigator findings into a self-contained HTML dossier and a PDF, in the fixed Nuculair design from the skill's PDF REPORT section: dark A4 pages, mint accent, Outfit + IBM Plex Mono, 12 numbered sections, an auto-generated exposure gauge and connection map, and running header/footer bands.

## Setup

```bash
bash scripts/setup.sh      # npm install, fetch + verify fonts, find Chrome/Chromium or install Playwright's Chromium
```

Requires Node.js 18+. `poppler-utils` (pdfinfo, pdffonts, pdftoppm) is optional and only used by the tests and for rasterising.
Set `PDI_CHROME=/path/to/chrome` to pick a specific browser.

## Usage

```bash
node render.js input.json out.pdf
```

Writes `out.pdf` and `out.html` (fonts embedded as base64; no external resources). Exits 1 with a list of errors if the input fails validation or the privacy guard.

```bash
npm run example            # renders examples/fictional-subject.json
npm test                   # schema, privacy guard, gauge, map, smoke render
pdftoppm -r 60 -png out.pdf page   # rasterise to check every page
```

## Input

See [SCHEMA.md](SCHEMA.md). `examples/fictional-subject.json` is a complete, fully fictional example (reserved example.* domains, invented names).

## Rules enforced in code

- Emails and phone numbers anywhere in the input fail validation; use `{ "label": "...", "withheld": "email" }` instead.
- Exposure: Low, Moderate, Moderate-High, High, High-Critical, Critical. Severity: High, Medium, Low. Confidence: High, Medium, Low, Unverified (0 sources ⇒ Unverified).
- At most 5 top exposures; map has 2–4 columns and edges must reference real nodes.
- The Mentions tile note must say which kinds it counts.

## Layout

```
render.js            CLI + render()      lib/build.js     HTML builder
lib/style.css        CSS from the skill  lib/gauge.js     gauge SVG + needle maths
lib/map.js           connection-map SVG  lib/validate.js  schema + privacy guard
lib/templates.js     header/footer       lib/chrome.js    browser discovery
lib/levels.js        allowed values      fonts/           OFL licenses (TTFs fetched by scripts/fonts.sh)
```

Code: MIT (LICENSE). Fonts: SIL OFL 1.1 (fonts/).
