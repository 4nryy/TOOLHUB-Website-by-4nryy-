import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatJson } from "./json-format";

describe("formatJson — normal behavior", () => {
  it("pretty prints with 2 spaces", () => {
    assert.equal(formatJson('{"a":1,"b":[1,2]}', "2"), '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  });
  it("pretty prints with 4 spaces", () => {
    assert.equal(formatJson('{"a":{"b":1}}', "4"), '{\n    "a": {\n        "b": 1\n    }\n}');
  });
  it("minifies and removes insignificant whitespace", () => {
    assert.equal(formatJson('{ "a": 1,\n  "b": [ 1, 2 ] }', "minify"), '{"a":1,"b":[1,2]}');
  });
  it("falls back to 2 spaces for an unknown or zero indent", () => {
    assert.equal(formatJson('{"a":1}', "abc"), '{\n  "a": 1\n}');
    assert.equal(formatJson('{"a":1}', "0"), '{\n  "a": 1\n}');
  });
  it("accepts primitives and empty containers", () => {
    assert.equal(formatJson("42", "2"), "42");
    assert.equal(formatJson('"x"', "2"), '"x"');
    assert.equal(formatJson("null", "2"), "null");
    assert.equal(formatJson("true", "minify"), "true");
    assert.equal(formatJson("[]", "2"), "[]");
    assert.equal(formatJson("{}", "2"), "{}");
  });
  it("preserves unicode and key order", () => {
    assert.equal(formatJson('{"z":1,"nama":"é 🌏","a":2}', "minify"), '{"z":1,"nama":"é 🌏","a":2}');
  });
  it("keeps the last value for duplicate keys (standard JSON.parse behavior)", () => {
    assert.equal(formatJson('{"a":1,"a":2}', "minify"), '{"a":2}');
  });
  it("handles deeply nested structures", () => {
    const deep = "[".repeat(200) + "]".repeat(200);
    assert.equal(formatJson(deep, "minify"), deep);
  });
});

describe("formatJson — empty and invalid input", () => {
  it("throws SyntaxError for empty and whitespace-only input", () => {
    assert.throws(() => formatJson("", "2"), SyntaxError);
    assert.throws(() => formatJson("   \n", "2"), SyntaxError);
  });
  it("throws SyntaxError for common mistakes", () => {
    assert.throws(() => formatJson("{a:1}", "2"), SyntaxError);          // unquoted key
    assert.throws(() => formatJson("{'a':1}", "2"), SyntaxError);        // single quotes
    assert.throws(() => formatJson('{"a":1,}', "2"), SyntaxError);       // trailing comma
    assert.throws(() => formatJson("undefined", "2"), SyntaxError);
    assert.throws(() => formatJson('{"a":1} extra', "2"), SyntaxError);
    assert.throws(() => formatJson('{"a":', "2"), SyntaxError);          // truncated
  });
});

describe("formatJson — KNOWN ISSUES (current behavior, may change in Task 2)", () => {
  it("silently loses precision for integers above Number.MAX_SAFE_INTEGER", () => {
    assert.equal(formatJson('{"id":12345678901234567890}', "minify"), '{"id":12345678901234567000}');
  });
  it("normalizes number literals (1.10 -> 1.1, 1e2 -> 100)", () => {
    assert.equal(formatJson('{"p":1.10,"e":1e2}', "minify"), '{"p":1.1,"e":100}');
  });
});
