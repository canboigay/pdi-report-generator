# Input schema

One JSON object. Every section maps to a numbered section of the PDF (see the PDF REPORT section of the Private Digital Investigator skill). `validate()` in `lib/validate.js` enforces everything below; `render.js` refuses to render on any error.

| Key | PDF section | Shape |
|---|---|---|
| `subject` | Cover | `{ name: string, city: string }` |
| `meta` | Cover meta row | `{ reportDate: string (include timezone), sourcesChecked: string }` |
| `tiles` | 01 At a glance | `{ accounts, domains, mentions, filings, dataBrokers, breaches }`, each `{ value: number|string, extra?: string, note: string, state: "found"|"warn"|"none" }`. `mentions` counts press/news/podcasts/events only, and its `note` must name the kinds (e.g. `"3 press · 1 event"`). |
| `exposure` | 02 Overall exposure | `{ level: "Low"|"Moderate"|"Moderate-High"|"High"|"High-Critical"|"Critical", assessment: string }`. The gauge is generated from `level`. |
| `timeline[]` | 03 Life timeline | `{ when: string, event: string, source: string, url?: string }` |
| `map` | 04 Connection map | `{ columns: string[2..4], nodes: [{ id, label, col: index into columns, own?: bool }], edges: [{ from: id, to: id, kind: "confirmed"|"possible"|"notthem" }] }`. Columns adapt to the subject, e.g. `["Own profiles","Employers/orgs","Coverage/events"]`. The SVG is generated. |
| `dossier[]` | 05 Identity dossier | `{ identifier: string | Withheld, type: string, status: "Confirmed"|"Possible"|"Not them", evidence: string, evidenceUrl?: string }` |
| `findings[]` | 06 Findings | `{ finding, type, link, date: string, sources: int >= 0, confidence: "High"|"Medium"|"Low"|"Unverified" }`. `sources: 0` requires `Unverified`. |
| `network` | 07 Network | `{ colleagues: string[], speakers: string[], organisations: string[] }`. Public figures and organisations only. |
| `exposures[]` | 08 Top exposures | max 5, `{ title, severity: "High"|"Medium"|"Low", description, fix: string, fixLink?: string }` |
| `breaches` | 09 Breaches | `{ status: "checked"|"not-checked", text: string }` |
| `notes[]` | 10 Investigator notes | `string[]` |
| `checklist[]` | 11 Cleanup checklist | `string[]` in priority order |
| `gaps` | 12 Gaps and possible matches | `{ unreachable: string, possible: string, ruledOut: string }` |

Keys starting with `_` (e.g. `_note`) are ignored by the renderer but still privacy-scanned.

## Withheld values

Email addresses, phone numbers and home addresses are never stored in the input. Use a withheld object where the value would go:

```json
{ "label": "Work inbox", "withheld": "email" }
```

`withheld` is one of `email`, `phone`, `address`; only `label` and `withheld` are allowed. It renders as `Work inbox [email withheld]`.

## Privacy guard

Every string anywhere in the input (including URLs) is scanned. Validation fails if it finds:
- an email address (`local@domain.tld`)
- a phone number (NANP forms like `250-555-0100`, `(250) 555 0100`, `250.555.0100`, `+1 …`, or any `+`-prefixed international number)

Long digit runs inside URL paths (post ids) are ignored for the phone check. Dates, years and short ids pass.

Also from the skill (not machine-checkable, the author's job): never name private third parties; a namesake mention that may concern a minor stays unlinked with minimal detail; employer-published work contacts show type and source only.
