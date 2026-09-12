import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Hooka landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /هوکا — آیین شب، از نو/);
  assert.match(html, /آیین شب/);
  assert.match(html, /تیولیپس/);
  assert.match(html, /ووکا/);
  assert.match(html, /قلیان عربی/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"Restaurant"/);
  assert.match(html, /icon\.svg/);
  assert.match(html, /og\.jpg/);
  assert.match(html, /width="1601"/);
  assert.match(html, /loading="lazy"/);
});

test("production static assets exist", async () => {
  await access(new URL("../public/robots.txt", import.meta.url));
  await access(new URL("../public/icon.svg", import.meta.url));
  await access(new URL("../public/og.jpg", import.meta.url));
  await access(new URL("../public/_headers", import.meta.url));

  const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
  assert.match(robots, /Allow: \//);
});

test("unused spin assets are not shipped", async () => {
  await assert.rejects(
    access(new URL("../public/images/spin/tulips/frame-001.jpg", import.meta.url)),
    /ENOENT/,
  );
});
