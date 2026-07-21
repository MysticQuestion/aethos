/**
 * PDF export via browser print pipeline (no native PDF binary dependency).
 * Opens a print-ready document; user chooses "Save as PDF".
 */

export type PrintExportSection = {
  heading: string;
  html: string;
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function markdownLiteToHtml(markdown: string): string {
  const escaped = escapeHtml(markdown);
  return escaped
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
      if (line.trim() === "") return "<br/>";
      return `<p>${line}</p>`;
    })
    .join("\n");
}

export function buildPrintDocument(options: {
  title: string;
  subtitle?: string;
  sections: PrintExportSection[];
  footerNote?: string;
}): string {
  const sections = options.sections
    .map(
      (section) => `
      <section class="block">
        <h2>${escapeHtml(section.heading)}</h2>
        <div class="body">${section.html}</div>
      </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    :root { color-scheme: light; }
    body {
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
      color: #1a1a1a;
      margin: 0;
      padding: 32px;
      line-height: 1.55;
      font-size: 12.5px;
    }
    header {
      border-bottom: 2px solid #c9a227;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #6b5a2a;
      font-weight: 700;
    }
    h1 { font-size: 26px; margin: 8px 0 4px; font-weight: 650; }
    .sub { color: #555; margin: 0; }
    h2 {
      font-size: 14px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 0 0 10px;
      color: #333;
    }
    .block { margin-bottom: 22px; page-break-inside: avoid; }
    .body p { margin: 0 0 8px; }
    .body h1, .body h2, .body h3 { margin: 12px 0 6px; }
    .body li { margin-left: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border-bottom: 1px solid #ddd; text-align: left; padding: 6px 4px; }
    th { color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
    footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 10px;
    }
    @media print {
      body { padding: 12mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">Aethos</div>
    <h1>${escapeHtml(options.title)}</h1>
    ${options.subtitle ? `<p class="sub">${escapeHtml(options.subtitle)}</p>` : ""}
  </header>
  ${sections}
  <footer>
    ${escapeHtml(
      options.footerNote ??
        "Aethos is designed for interpretation and reflection. Not medical, legal, financial, or guaranteed predictive advice."
    )}
    <div class="no-print" style="margin-top:12px">
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>
  </footer>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.focus(); window.print(); }, 250);
    });
  </script>
</body>
</html>`;
}

export function openPrintExport(htmlDocument: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([htmlDocument], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!popup) {
    // Popup blocked — fall back to same-tab navigation.
    window.location.href = url;
    return;
  }
  // Revoke after print window has a chance to load.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function exportMarkdownReportAsPdf(options: {
  title: string;
  markdown: string;
  subtitle?: string;
}): void {
  openPrintExport(
    buildPrintDocument({
      title: options.title,
      subtitle: options.subtitle,
      sections: [{ heading: "Report", html: markdownLiteToHtml(options.markdown) }]
    })
  );
}

export function exportAstrocartographyAsPdf(options: {
  title: string;
  subtitle?: string;
  linesHtml: string;
  mapNote?: string;
  mathJson?: string;
}): void {
  openPrintExport(
    buildPrintDocument({
      title: options.title,
      subtitle: options.subtitle,
      sections: [
        { heading: "Planetary lines", html: options.linesHtml },
        ...(options.mapNote
          ? [{ heading: "Map", html: `<p>${escapeHtml(options.mapNote)}</p>` }]
          : []),
        ...(options.mathJson
          ? [
              {
                heading: "Engine metadata (Show the Math)",
                html: `<pre style="white-space:pre-wrap;font-size:10px;background:#f6f4ef;padding:10px;border-radius:6px">${escapeHtml(options.mathJson)}</pre>`
              }
            ]
          : [])
      ]
    })
  );
}
