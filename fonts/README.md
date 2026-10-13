# Fonts

| File | Family | License | Source |
|---|---|---|---|
| Outfit-Variable.ttf | Outfit (variable, wght 100–900) | SIL OFL 1.1, see OFL-Outfit.txt | github.com/google/fonts/tree/main/ofl/outfit |
| IBMPlexMono-Regular/Medium/SemiBold.ttf | IBM Plex Mono 400/500/600 | SIL OFL 1.1, see OFL-IBMPlexMono.txt (Reserved Font Name "Plex") | github.com/google/fonts/tree/main/ofl/ibmplexmono |

The .ttf files are not committed: `scripts/fonts.sh` (run by `scripts/setup.sh`) downloads them from google/fonts at a pinned commit and verifies each SHA-256. The files are unmodified and are embedded unmodified (base64 @font-face) in the generated HTML, which the OFL permits. Don't subset or rename them under the reserved name "Plex".
