import { describe, expect, it } from "vitest";
import {
  buildPrintDocument,
  escapeHtml,
  markdownLiteToHtml
} from "@/lib/aethos/pdf/print-export";

describe("PDF print export pipeline", () => {
  it("escapes HTML and renders markdown headings", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    const html = markdownLiteToHtml("# Title\n\n- item");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<li>item</li>");
  });

  it("builds a print document with Aethos branding", () => {
    const doc = buildPrintDocument({
      title: "Core Brief",
      subtitle: "test",
      sections: [{ heading: "Body", html: "<p>Hello</p>" }]
    });
    expect(doc).toContain("Aethos");
    expect(doc).toContain("Core Brief");
    expect(doc).toContain("window.print");
    expect(doc).toContain("Hello");
  });
});
