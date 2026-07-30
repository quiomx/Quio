import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

async function managementRuntime() {
  const storage = new Map();
  const localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
  };
  const window = {
    dispatchEvent() {},
    addEventListener() {},
  };
  const context = vm.createContext({
    window,
    localStorage,
    crypto: webcrypto,
    console,
    Intl,
    Date,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    RegExp,
    CustomEvent: class CustomEvent {},
    document: { querySelector() { return null; }, querySelectorAll() { return []; } },
  });
  await vm.runInContext(
    await readFile(new URL("../public/gestion/js/core.js", import.meta.url), "utf8"),
    context,
  );
  await vm.runInContext(
    await readFile(new URL("../public/gestion/js/documents.js", import.meta.url), "utf8"),
    context,
  );
  return window;
}

test("blocks zero-value quotes unless free service is explicitly confirmed", async () => {
  const { QuioDocuments: documents } = await managementRuntime();
  const input = {
    clientId: "",
    businessId: "",
    deliverablesText: "Servicio Quio | 1 | 0",
    extrasText: "",
    price: 0,
    taxRate: 0,
    depositPct: 50,
    status: "Borrador",
  };
  assert.throws(() => documents.prepareQuote({ ...input }), /total \$0\.00/i);
  const free = documents.prepareQuote({ ...input, freeService: "on" });
  assert.equal(free.freeService, true);
});

test("deletes an unlinked quote and preserves related data APIs", async () => {
  const { QuioCore: core } = await managementRuntime();
  const quote = core.upsert("quotes", { folio: "QUIO-2026-9999", status: "Borrador" }, "quo");
  assert.equal(core.remove("quotes", quote.id), true);
  assert.equal(core.get("quotes", quote.id), undefined);
});

test("ships safe client and project deletion plus financial autosave", async () => {
  const operations = await readFile(new URL("../public/gestion/js/operations.js", import.meta.url), "utf8");
  assert.match(operations, /data-client-action="delete:/);
  assert.match(operations, /data-delete-project=/);
  assert.match(operations, /No se puede eliminar: tiene/);
  assert.match(operations, /data-financial-save-status/);
  assert.match(operations, /quio:financial-settings-updated/);
});

test("deletes project documents without creating a quote-project deadlock", async () => {
  const [operations, documents] = await Promise.all([
    readFile(new URL("../public/gestion/js/operations.js", import.meta.url), "utf8"),
    readFile(new URL("../public/gestion/js/documents.js", import.meta.url), "utf8"),
  ]);
  assert.match(operations, /documents\.forEach\(document=>C\.remove\('documents',document\.id\)\)/);
  assert.match(operations, /después podrá eliminarse por separado/);
  assert.match(documents, /elimina primero el proyecto desde Proyectos/);
});

test("keeps toast notifications visible above an open modal", async () => {
  const [app, styles] = await Promise.all([
    readFile(new URL("../public/gestion/js/app.js", import.meta.url), "utf8"),
    readFile(new URL("../public/gestion/styles.css", import.meta.url), "utf8"),
  ]);
  assert.match(app, /openDialogs=\$\$\('dialog\[open\]'\)/);
  assert.match(app, /host\.appendChild\(el\)/);
  assert.match(styles, /dialog #toast\{position:absolute/);
});

test("ships focused search, delegated client actions, safe quote deletion and compact projects", async () => {
  const [html, app, operations, documents, styles] = await Promise.all([
    readFile(new URL("../public/gestion/index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/gestion/js/app.js", import.meta.url), "utf8"),
    readFile(new URL("../public/gestion/js/operations.js", import.meta.url), "utf8"),
    readFile(new URL("../public/gestion/js/documents.js", import.meta.url), "utf8"),
    readFile(new URL("../public/gestion/styles.css", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(html, /id="quickAdd"/);
  assert.match(app, /setTimeout\(\(\)=>globalSearch\(value\),180\)/);
  assert.match(operations, /results\.innerHTML=clientRowsMarkup\(\)/);
  assert.match(operations, /document\.addEventListener\('click'/);
  assert.match(documents, /data-delete-quote/);
  assert.match(documents, /Cotización vinculada a un proyecto/);
  assert.match(styles, /\.project-card__actions\{display:flex;flex-wrap:wrap/);
  assert.match(styles, /\.investment-block/);
});

test("uses generic NFC labels in user-facing copy", async () => {
  const files = await Promise.all([
    "core.js",
    "operations.js",
    "documents.js",
    "app.js",
  ].map(name => readFile(new URL(`../public/gestion/js/${name}`, import.meta.url), "utf8")));
  const source = files.join("\n");
  assert.doesNotMatch(source, /Tarjetas? NFC|Stand NFC|Punto NFC|Dispositivo NFC|Producto NFC/i);
});
