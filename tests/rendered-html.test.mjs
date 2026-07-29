import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Quio marketing site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Quio — Que te encuentren, confíen y te elijan<\/title>/i);
  assert.match(html, /Quiero mi revisión gratis/);
  assert.match(html, /Presencia digital para negocios locales/);
});

test("ships Gestión Quio V10 with exactly seven visible modules", async () => {
  const html = await readFile(new URL("../public/gestion/index.html", import.meta.url), "utf8");
  const routes = [...html.matchAll(/data-route="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(routes, [
    "dashboard",
    "clients",
    "reviews",
    "quotes",
    "projects",
    "finance",
    "settings",
  ]);
  assert.match(html, /js\/operations\.js/);
  assert.match(html, /assets\/images\/logo-quio\.png/);
  assert.match(html, /formnovalidate[^>]*>Cancelar/);
  assert.doesNotMatch(html, /data-route="(?:prospects|followups|packages|documents|time|inventory)"/);
});

test("keeps ordered Supabase migrations and V10 documentation", async () => {
  const migrations = await readdir(new URL("../supabase/migrations/", import.meta.url));
  assert.deepEqual(migrations.sort(), [
    "001_gestion_v10_normalized_schema.sql",
    "002_gestion_v10_backfill.sql",
    "003_gestion_v10_migration_report.sql",
  ]);
  const report = await readFile(new URL("../MIGRATION_REPORT.md", import.meta.url), "utf8");
  assert.match(report, /No se elimina ninguna tabla ni registro/);
  assert.match(report, /375 px sin desbordamiento horizontal/);
});
