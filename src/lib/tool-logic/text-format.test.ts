import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatText } from "./text-format";

const MODES = ["uppercase", "lowercase", "title", "sentence", "trim", "spaces"] as const;

describe("formatText — normal behavior", () => {
  it("uppercase", () => assert.equal(formatText("Hello World", "uppercase"), "HELLO WORLD"));
  it("lowercase", () => assert.equal(formatText("Hello WORLD", "lowercase"), "hello world"));
  it("title case", () => assert.equal(formatText("hello wORLD from toolhub", "title"), "Hello World From Toolhub"));
  it("title case keeps leading whitespace", () => assert.equal(formatText("  hello", "title"), "  Hello"));
  it("sentence case capitalizes after . ! ?", () => {
    assert.equal(formatText("hello world. how ARE you? fine!", "sentence"), "Hello world. How are you? Fine!");
  });
  it("trim removes spaces at the start/end of every line", () => {
    assert.equal(formatText("  a  \n   b  ", "trim"), "a\nb");
  });
  it("spaces collapses all whitespace (including newlines) into single spaces", () => {
    assert.equal(formatText("  a   b \n c ", "spaces"), "a b c");
  });
  it("an unknown mode falls back to 'spaces'", () => {
    assert.equal(formatText("  a   b ", "nonsense"), "a b");
  });
  it("preserves newlines in case-changing modes", () => {
    assert.equal(formatText("a\nb", "uppercase"), "A\nB");
  });
});

describe("formatText — empty and whitespace-only input", () => {
  for (const mode of MODES) {
    it(`empty string stays empty (${mode})`, () => assert.equal(formatText("", mode), ""));
  }
  it("whitespace-only input becomes empty in 'spaces' mode", () => assert.equal(formatText("   \n  ", "spaces"), ""));
  it("whitespace-only input is left alone by title/sentence", () => {
    assert.equal(formatText("   ", "title"), "   ");
    assert.equal(formatText("   ", "sentence"), "   ");
  });
});

describe("formatText — edge cases", () => {
  it("handles emoji and digits without throwing", () => {
    assert.equal(formatText("😀 abc 123", "uppercase"), "😀 ABC 123");
    assert.equal(formatText("😀 abc 123", "title"), "😀 Abc 123");
  });
  it("handles Windows line endings in 'trim' mode", () => {
    assert.equal(formatText("  a \r\n b ", "trim"), "a\nb");
  });
  it("handles a very long input", () => {
    const long = "word ".repeat(20000);
    assert.equal(formatText(long, "spaces"), "word ".repeat(19999) + "word");
  });
});

describe("formatText — KNOWN ISSUES (current behavior, may change in Task 2)", () => {
  it("title/sentence lowercase the whole text first, so acronyms are damaged", () => {
    assert.equal(formatText("NASA launched", "title"), "Nasa Launched");
    assert.equal(formatText("NASA launched. FBI too.", "sentence"), "Nasa launched. Fbi too.");
  });
  it("'trim' mode also collapses runs of spaces INSIDE a line (label says only 'Trim each line')", () => {
    assert.equal(formatText("a    b", "trim"), "a b");
  });
  it("sentence case does not capitalize a non-ASCII first letter (regex uses \\w)", () => {
    assert.equal(formatText("étude. égal", "sentence"), "étude. égal");
  });
});
