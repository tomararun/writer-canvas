import { afterEach, describe, expect, it } from "vitest";

import { getSiteOrigin } from "./site-url.server";

const ORIGINAL_SITE_URL = process.env["SITE_URL"];

afterEach(() => {
  if (ORIGINAL_SITE_URL === undefined) delete process.env["SITE_URL"];
  else process.env["SITE_URL"] = ORIGINAL_SITE_URL;
});

describe("getSiteOrigin", () => {
  it("uses the request origin by default", () => {
    delete process.env["SITE_URL"];
    const request = new Request("https://example.com/rss.xml");
    expect(getSiteOrigin(request)).toBe("https://example.com");
  });

  it("prefers proxy forwarding headers", () => {
    delete process.env["SITE_URL"];
    const request = new Request("http://internal:3000/sitemap.xml", {
      headers: { "x-forwarded-proto": "https", "x-forwarded-host": "example.com" },
    });
    expect(getSiteOrigin(request)).toBe("https://example.com");
  });

  it("uses only the first value of comma-separated forwarding headers", () => {
    delete process.env["SITE_URL"];
    const request = new Request("http://internal:3000/", {
      headers: { "x-forwarded-proto": "https, http", "x-forwarded-host": "example.com, proxy" },
    });
    expect(getSiteOrigin(request)).toBe("https://example.com");
  });

  it("lets SITE_URL override everything and strips trailing slashes", () => {
    process.env["SITE_URL"] = "https://configured.example/";
    const request = new Request("http://internal:3000/", {
      headers: { "x-forwarded-host": "other.example" },
    });
    expect(getSiteOrigin(request)).toBe("https://configured.example");
  });
});
