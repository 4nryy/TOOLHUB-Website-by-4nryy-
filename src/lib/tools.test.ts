import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { categories, getTool, tools } from "./tools";

/** The 12 starter tools. If one disappears or is renamed by accident, this list catches it. */
const EXPECTED_SLUGS = [
  "word-counter", "text-formatter", "json-formatter", "base64-encoder", "uuid-generator", "qr-generator",
  "image-compressor", "pdf-merger", "percentage-calculator", "date-calculator", "pomodoro-timer", "invoice-generator",
];

describe("tool registry (src/lib/tools.ts)", () => {
  it("contains exactly the 12 starter tools", () => {
    assert.equal(tools.length, 12);
    assert.deepEqual(tools.map((t) => t.slug).sort(), [...EXPECTED_SLUGS].sort());
  });
  it("has unique, URL-safe (kebab-case) slugs", () => {
    const slugs = tools.map((t) => t.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
  it("has non-empty name, description, icon and keywords for every tool", () => {
    for (const t of tools) {
      assert.ok(t.name.trim(), `${t.slug}: name`);
      assert.ok(t.description.trim(), `${t.slug}: description`);
      assert.ok(t.icon.trim(), `${t.slug}: icon`);
      assert.ok(t.keywords.length > 0, `${t.slug}: keywords`);
    }
  });
  it("assigns every tool to a declared category", () => {
    const names = new Set<string>(categories.map((c) => c.name));
    for (const t of tools) assert.ok(names.has(t.category), `${t.slug}: unknown category ${t.category}`);
  });
  it("has no empty categories and unique category names", () => {
    assert.equal(new Set(categories.map((c) => c.name)).size, categories.length);
    for (const c of categories) assert.ok(tools.some((t) => t.category === c.name), `empty category ${c.name}`);
  });
  it("only uses supported processing values", () => {
    for (const t of tools) assert.ok(["Local", "Hybrid"].includes(t.processing), `${t.slug}: ${t.processing}`);
  });
  it("marks at least 4 tools as popular (the home page shows the first 4)", () => {
    assert.ok(tools.filter((t) => t.popular).length >= 4);
  });
});

describe("getTool", () => {
  it("returns the tool for a known slug", () => assert.equal(getTool("json-formatter")?.name, "JSON Formatter"));
  it("returns undefined for an unknown, empty or differently-cased slug", () => {
    assert.equal(getTool("does-not-exist"), undefined);
    assert.equal(getTool(""), undefined);
    assert.equal(getTool("JSON-FORMATTER"), undefined);
  });
  it("does not resolve object-prototype names", () => {
    assert.equal(getTool("__proto__"), undefined);
    assert.equal(getTool("constructor"), undefined);
  });
});
