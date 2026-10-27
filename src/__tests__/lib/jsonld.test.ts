import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getArticleJsonLd, getProductJsonLd, getProjectJsonLd, safeJsonLd } from "@/lib/jsonld";

const payloads = [
  "</script><img src=x onerror=alert(1)>",
  "</ScRiPt ><script>alert(1)</script>",
  "</script\t><svg onload=alert(1)>",
  "<!--<script></script><img src=x onerror=alert(1)>",
];

function parseScript(value: object, serialize = safeJsonLd) {
  const html = renderToStaticMarkup(
    createElement("script", {
      type: "application/ld+json",
      dangerouslySetInnerHTML: { __html: serialize(value) },
    }),
  );
  return new DOMParser().parseFromString(html, "text/html");
}

describe("safeJsonLd", () => {
  it("demonstrates that raw JSON.stringify permits an HTML breakout", () => {
    const doc = parseScript({ name: payloads[0] }, JSON.stringify);
    expect(doc.querySelector("img[onerror]")).not.toBeNull();
  });

  it.each(payloads)("keeps attacker content inside the JSON-LD script: %s", (payload) => {
    const data = { [payload]: [{ name: payload }] };
    const serialized = safeJsonLd(data);
    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c");
    const doc = parseScript(data);
    expect(doc.querySelectorAll("script")).toHaveLength(1);
    expect(doc.querySelector("img, svg, [onerror], [onload]")).toBeNull();
    expect(JSON.parse(doc.querySelector("script")!.textContent!)).toEqual(data);
  });

  it.each(payloads)(
    "protects author names and content through the schema builders: %s",
    (payload) => {
      const schemas = [
        getProjectJsonLd({
          title: payload,
          description: payload,
          authorDisplayName: payload,
          slug: "project",
          createdAt: new Date("2026-01-01"),
        }),
        getArticleJsonLd({
          title: payload,
          excerpt: payload,
          authorDisplayName: payload,
          slug: "post",
        }),
        getProductJsonLd({
          title: payload,
          description: payload,
          slug: "product",
          priceCents: 1234,
        }),
      ];
      for (const schema of schemas) {
        const doc = parseScript(schema);
        expect(doc.querySelectorAll("script")).toHaveLength(1);
        expect(doc.querySelector("img, svg")).toBeNull();
        expect(JSON.parse(doc.querySelector("script")!.textContent!)).toEqual(
          JSON.parse(JSON.stringify(schema)),
        );
      }
    },
  );

  it("preserves legitimate JSON values and serialization semantics", () => {
    const data = {
      name: 'João & Inês <3 > "VibeTuga"',
      separator: "\u2028\u2029",
      literal: "\\u003c",
      empty: "",
      nested: [null, true, 12.34],
      omitted: undefined,
      created: new Date("2026-01-01"),
      url: "https://example.com/?a=1&b=2",
    };
    const serialized = safeJsonLd(data);
    expect(serialized).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(serialized)).toEqual(JSON.parse(JSON.stringify(data)));
  });
});
