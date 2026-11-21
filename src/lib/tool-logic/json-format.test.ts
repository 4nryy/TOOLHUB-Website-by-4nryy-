import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MAX_JSON_DEPTH, formatJson } from "./json-format";

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


describe("formatJson — large integers and number literals are preserved exactly", () => {
  it("does not lose precision above Number.MAX_SAFE_INTEGER", () => {
    assert.equal(formatJson('{"id":12345678901234567890}', "minify"), '{"id":12345678901234567890}');
    assert.equal(formatJson("9007199254740993", "minify"), "9007199254740993"); // MAX_SAFE_INTEGER + 2
    assert.equal(formatJson("-9007199254740993", "2"), "-9007199254740993");
    assert.equal(formatJson("[18446744073709551615,340282366920938463463374607431768211455]", "minify"), "[18446744073709551615,340282366920938463463374607431768211455]");
  });
  it("preserves very long integers and very long decimals", () => {
    const longInt = "1".repeat(200);
    const longDecimal = "0." + "3".repeat(100);
    assert.equal(formatJson(`[${longInt},${longDecimal}]`, "minify"), `[${longInt},${longDecimal}]`);
  });
  it("preserves large integers in pretty-printed, nested output", () => {
    assert.equal(formatJson('{"a":{"id":12345678901234567890}}', "2"), '{\n  "a": {\n    "id": 12345678901234567890\n  }\n}');
  });
  it("preserves number literals exactly as written (1.10, 1e2, -0, 1E+2, 0.0, 5e-324, 1e400)", () => {
    const literals = ["1.10", "1e2", "1E+2", "-0", "0.0", "-0.0", "5e-324", "1e400", "-1e-400", "0e0", "123456789.123456789123456789", "1.7976931348623157e309"];
    for (const literal of literals) {
      assert.equal(formatJson(`[${literal}]`, "minify"), `[${literal}]`, literal);
      assert.equal(formatJson(`{"n":${literal}}`, "2"), `{\n  "n": ${literal}\n}`, literal);
    }
  });
  it("leaves ordinary numbers unchanged", () => {
    assert.equal(formatJson('{"a":1,"b":-2,"c":3.5,"d":0,"e":1e3,"f":0.000001}', "minify"), '{"a":1,"b":-2,"c":3.5,"d":0,"e":1e3,"f":0.000001}');
  });
  it("does not touch digits that are inside strings or keys", () => {
    assert.equal(formatJson('{"12345678901234567890":"12345678901234567890"}', "minify"), '{"12345678901234567890":"12345678901234567890"}');
  });
  it("is idempotent and minify(pretty(x)) equals minify(x)", () => {
    const doc = '{ "id": 12345678901234567890, "p": 1.10, "list": [1e2, -0, {"k": [true, null]}], "s": "x" }';
    const pretty = formatJson(doc, "2");
    assert.equal(formatJson(pretty, "2"), pretty);
    assert.equal(formatJson(pretty, "minify"), formatJson(doc, "minify"));
    assert.equal(formatJson(formatJson(doc, "4"), "2"), pretty);
  });
});

describe("formatJson — strings, keys and structure", () => {
  it("keeps string values intact and normalizes escape spelling like JSON.stringify", () => {
    assert.equal(formatJson('"\\u00e9"', "minify"), '"é"');
    assert.equal(formatJson('"\\/"', "minify"), '"/"');
    assert.equal(formatJson('"a\\nb\\t\\"q\\"\\\\"', "minify"), '"a\\nb\\t\\"q\\"\\\\"');
    assert.equal(formatJson('"\\ud800"', "minify"), '"\\ud800"'); // lone surrogate stays escaped
    assert.equal(formatJson('"🌏 日本語"', "minify"), '"🌏 日本語"');
  });
  it("supports escaped and unicode keys", () => {
    assert.equal(formatJson('{"a\\"b":1,"é":2,"":3}', "minify"), '{"a\\"b":1,"é":2,"":3}');
  });
  it("keeps object key order as written, including integer-like keys (JSON.parse would reorder them)", () => {
    assert.equal(formatJson('{"b":1,"2":2,"1":3}', "minify"), '{"b":1,"2":2,"1":3}');
  });
  it("keeps the first position and the last value of a duplicate key (same as JSON.parse)", () => {
    assert.equal(formatJson('{"a":1,"b":2,"a":3}', "minify"), '{"a":3,"b":2}');
  });
  it("handles a '__proto__' key as ordinary data", () => {
    assert.equal(formatJson('{"__proto__":1,"x":2}', "minify"), '{"__proto__":1,"x":2}');
  });
  it("pretty-prints empty containers inline and nests them correctly", () => {
    assert.equal(formatJson('{"a":[],"b":{},"c":[{}],"d":[[]]}', "2"), '{\n  "a": [],\n  "b": {},\n  "c": [\n    {}\n  ],\n  "d": [\n    []\n  ]\n}');
  });
  it("accepts any JSON whitespace between tokens (space, tab, CR, LF)", () => {
    assert.equal(formatJson(' \t\r\n{ "a" :\n[ 1 ,\t2 ] }\r\n', "minify"), '{"a":[1,2]}');
  });
  it("caps indentation at 10 spaces, and a width below 1 prints compact output (like JSON.stringify)", () => {
    const value = { a: 1 };
    assert.equal(formatJson('{"a":1}', "10"), JSON.stringify(value, null, 10));
    assert.equal(formatJson('{"a":1}', "11"), JSON.stringify(value, null, 10));
    assert.equal(formatJson('{"a":1}', "-1"), '{"a":1}');
    assert.equal(formatJson('{"a":1}', "0.5"), '{"a":1}');
    assert.equal(formatJson('{"a":1}', ""), '{\n  "a": 1\n}');
  });
});

describe("formatJson — invalid JSON gives an understandable SyntaxError", () => {
  const message = (input: string) => {
    try { formatJson(input, "2"); } catch (error) {
      assert.ok(error instanceof SyntaxError, `not a SyntaxError for ${JSON.stringify(input)}`);
      return error.message;
    }
    return assert.fail(`expected an error for ${JSON.stringify(input)}`);
  };
  it("says the input is empty for empty and whitespace-only text (no position)", () => {
    assert.equal(message(""), "Invalid JSON: the input is empty.");
    assert.equal(message("  \n\t "), "Invalid JSON: the input is empty.");
  });
  it("reports line and column", () => {
    assert.match(message('{"a":1,}'), /^Invalid JSON at line 1, column 8: /);
    assert.match(message('{\n  "a": 1,\n  "b": oops\n}'), /^Invalid JSON at line 3, column 8: /);
    assert.match(message('[\r\n1,\r\n2,\r\n@]'), /line 4, column 1: /);
  });
  it("explains a trailing comma", () => {
    assert.match(message('{"a":1,}'), /trailing comma before "}"/);
    assert.match(message("[1,2,]"), /trailing comma before "]"/);
  });
  it("explains unquoted keys and single quotes", () => {
    assert.match(message("{a:1}"), /double-quoted property name/);
    assert.match(message("{'a':1}"), /double-quoted property name/);
    assert.match(message("'text'"), /single quotes are not allowed, JSON strings must use double quotes/);
  });
  it("explains JavaScript-only values", () => {
    for (const word of ["undefined", "NaN", "Infinity", "True", "nul"]) {
      assert.match(message(`[${word}]`), new RegExp(`unexpected value "${word}" \\(JSON only allows true, false and null`), word);
    }
  });
  it("rejects invalid number spellings", () => {
    for (const bad of ["01", "+1", ".5", "1.", "0x10", "1e", "1e+", "-", "--1", "1.2.3", "1_000"]) {
      assert.match(message(`[${bad}]`), /invalid number/, bad);
    }
  });
  it("rejects bad strings: raw line break, invalid escapes, short \\u escape, unterminated", () => {
    assert.match(message('["a\nb"]'), /raw line break or control character/);
    assert.match(message('["a\tb"]'), /raw line break or control character/);
    assert.match(message('["\\x"]'), /invalid escape sequence "\\x"/);
    assert.match(message('["\\u12G4"]'), /invalid \\u escape/);
    assert.match(message('["abc'), /unterminated string/);
    assert.match(message('["abc\\'), /unterminated string/);
  });
  it("rejects truncated documents and extra content after the value", () => {
    assert.match(message('{"a":'), /unexpected end of input/);
    assert.match(message("[1,2"), /unexpected end of input/);
    assert.match(message('{"a":1}}'), /after the end of the JSON value/);
    assert.match(message("{} x"), /after the end of the JSON value/);
    assert.match(message("1 2"), /after the end of the JSON value/);
  });
  it("names invisible characters by code point (BOM, non-breaking space)", () => {
    assert.match(message("\uFEFF{}"), /U\+FEFF/);
    assert.match(message("{\u00a0}"), /U\+00A0/);
  });
  it("rejects structural mistakes", () => {
    for (const bad of ["{", "}", "[", "]", '{"a"}', '{"a" 1}', '{"a":1 "b":2}', "[1 2]", "[,]", "[1,,2]", '{,"a":1}', '{"a":1,,"b":2}', ":", ","]) {
      assert.throws(() => formatJson(bad, "2"), SyntaxError, bad);
    }
  });
});

describe("formatJson — nesting limit", () => {
  const nested = (levels: number) => "[".repeat(levels) + "]".repeat(levels);
  it(`accepts exactly ${MAX_JSON_DEPTH} levels, minified and pretty-printed`, () => {
    assert.equal(formatJson(nested(MAX_JSON_DEPTH), "minify"), nested(MAX_JSON_DEPTH));
    assert.doesNotThrow(() => formatJson(nested(MAX_JSON_DEPTH), "2"));
  });
  it(`rejects ${MAX_JSON_DEPTH + 1} levels with a readable SyntaxError (no stack overflow)`, () => {
    assert.throws(() => formatJson(nested(MAX_JSON_DEPTH + 1), "2"), { name: "SyntaxError", message: /deeper than 1000 levels/ });
    assert.throws(() => formatJson("[".repeat(200000), "2"), SyntaxError);
  });
  it("applies the same limit to objects", () => {
    const deepObject = '{"a":'.repeat(MAX_JSON_DEPTH + 1) + "1" + "}".repeat(MAX_JSON_DEPTH + 1);
    assert.throws(() => formatJson(deepObject, "2"), /deeper than 1000 levels/);
  });
});

describe("formatJson — agrees with JSON.parse (differential tests, JSON.parse is the oracle)", () => {
  // Deterministic pseudo-random generator so failures are reproducible.
  let seed = 20261120;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const int = (n: number) => Math.floor(random() * n);
  const pick = <T,>(items: T[]): T => items[int(items.length)];
  const STRINGS = ["", "a", "héllo", "🌏", "line\nbreak", "tab\t", 'q"uote', "back\\slash", "\u2028", "\u0001", "/", "\ud800", "日本語"];
  const WS = ["", "", " ", "\n", "\t ", "\r\n  "];
  function generate(depth: number): unknown {
    const kind = int(depth > 3 ? 6 : 9);
    if (kind === 0) return null;
    if (kind === 1) return random() < 0.5;
    if (kind === 2) return int(2000000) - 1000000;
    if (kind === 3) return Math.round((random() - 0.5) * 1e6) / 1e3;
    if (kind === 4) return pick(STRINGS);
    if (kind === 5) return random() * 1e21;
    if (kind <= 7) return Array.from({ length: int(5) }, () => generate(depth + 1));
    const object: Record<string, unknown> = {};
    for (let i = 0, n = int(5); i < n; i++) object["k" + int(50) + pick(["", "é", " x"])] = generate(depth + 1);
    return object;
  }
  function serialize(value: unknown): string {
    const ws = () => pick(WS);
    if (Array.isArray(value)) return "[" + ws() + value.map((item) => ws() + serialize(item) + ws()).join(",") + ws() + "]";
    if (value && typeof value === "object") {
      return "{" + ws() + Object.entries(value).map(([k, v]) => ws() + JSON.stringify(k) + ws() + ":" + ws() + serialize(v) + ws()).join(",") + ws() + "}";
    }
    return JSON.stringify(value);
  }

  it("prints valid documents exactly like JSON.stringify(JSON.parse(x), null, n) (500 random documents x 3 modes)", () => {
    for (let i = 0; i < 500; i++) {
      const text = pick(WS) + serialize(generate(0)) + pick(WS);
      const parsed = JSON.parse(text);
      assert.equal(formatJson(text, "2"), JSON.stringify(parsed, null, 2), text);
      assert.equal(formatJson(text, "4"), JSON.stringify(parsed, null, 4), text);
      assert.equal(formatJson(text, "minify"), JSON.stringify(parsed), text);
    }
  });

  it("accepts and rejects the same mutated inputs as JSON.parse (3000 random mutations)", () => {
    const alphabet = "{}[],:\"\\ \n\t\r0123456789eE.+-tfnulrs'abcx\u00a0\ufeff\u0001".split("");
    let accepted = 0;
    let rejected = 0;
    for (let i = 0; i < 3000; i++) {
      let text = serialize(generate(0));
      for (let m = 0, mutations = 1 + int(3); m < mutations; m++) {
        const at = int(text.length + 1);
        const action = int(3);
        text = action === 0 ? text.slice(0, at) + pick(alphabet) + text.slice(at)
          : action === 1 ? text.slice(0, at) + text.slice(at + 1)
          : text.slice(0, at) + pick(alphabet) + text.slice(at + 1);
      }
      let oracleAccepts = true;
      try { JSON.parse(text); } catch { oracleAccepts = false; }
      let ourAccepts = true;
      try { formatJson(text, "minify"); } catch (error) {
        ourAccepts = false;
        assert.ok(error instanceof SyntaxError && /^Invalid JSON/.test(error.message), `bad error shape for ${JSON.stringify(text)}`);
      }
      assert.equal(ourAccepts, oracleAccepts, `disagreement on ${JSON.stringify(text)}`);
      if (ourAccepts) accepted++; else rejected++;
    }
    assert.ok(accepted > 100 && rejected > 100, `corpus is unbalanced (accepted ${accepted}, rejected ${rejected})`);
  });

  it("agrees with JSON.parse on a hand-written corpus of edge cases", () => {
    const corpus = [
      "0", "-0", "1", "-1", "1.5", "1e5", "1E-5", "true", "false", "null", '""', '"a"', "[]", "{}", "[[]]", "[{}]", '{"a":{}}',
      "01", "1.", ".1", "+1", "1e", "-", "--1", "0x1", "NaN", "Infinity", "-Infinity", "undefined", "True", "'a'", "[1,]", '{"a":1,}',
      "[,1]", "{,}", '{"a"}', '{a:1}', "[1 2]", '"\\u00"', '"\\x41"', '"\\"', '"\n"', '"\t"', "tru", "nul", "[true false]", "{}{}", "[]]",
      "", " ", "\u00a0", "\ufeff[]", "/* c */ []", "[] // c", "[1\n,\n2]", '{"a"\n:\n1}', "\u2028[]",
    ];
    for (const text of corpus) {
      let oracleAccepts = true;
      try { JSON.parse(text); } catch { oracleAccepts = false; }
      let ourAccepts = true;
      try { formatJson(text, "2"); } catch { ourAccepts = false; }
      assert.equal(ourAccepts, oracleAccepts, `disagreement on ${JSON.stringify(text)}`);
    }
  });
});

describe("formatJson — KNOWN LIMITATIONS (documented, current behavior)", () => {
  it("duplicate keys are not preserved: the last value wins (same as JSON.parse); earlier data is dropped", () => {
    assert.equal(formatJson('{"a":1,"a":2,"a":3}', "minify"), '{"a":3}');
  });
  it("nesting deeper than MAX_JSON_DEPTH is rejected even though JSON.parse could read it", () => {
    const text = "[".repeat(MAX_JSON_DEPTH + 1) + "]".repeat(MAX_JSON_DEPTH + 1);
    assert.doesNotThrow(() => JSON.parse(text));
    assert.throws(() => formatJson(text, "2"), SyntaxError);
  });
});
