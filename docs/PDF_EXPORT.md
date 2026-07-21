# PDF export

Aethos uses a **print-to-PDF** pipeline (no binary PDF library required):

1. Build a branded HTML document (`buildPrintDocument`)  
2. Open it in a new window  
3. Auto-invoke `window.print()` — user chooses **Save as PDF**

## Entry points

| Surface | Action |
| --- | --- |
| `/reports` | **PDF** button on active report |
| `/astrocartography` | **Export PDF (print)** for line table + method metadata |

Code: `src/lib/aethos/pdf/print-export.ts`

## Why print pipeline

- Zero new native dependencies  
- Works offline in local demo mode  
- Typography controlled by print CSS  
- Practitioner can print paper or archive PDF  

## Future (optional)

Server-side PDF (Chromium / Playwright) for batch practitioner exports and white-label letterhead without browser UI.