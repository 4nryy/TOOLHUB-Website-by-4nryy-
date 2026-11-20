import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getWordStats } from "./word-stats";

const words = (n: number) => Array.from({ length: n }, () => "kata").join(" ");

describe("getWordStats — normal behavior", () => {
  it("counts words and characters", () => {
    assert.deepEqual(getWordStats("Hello world"), { words: 2, characters: 11, noSpaces: 10, sentences: 0, reading: 1 });
  });
  it("counts sentences ended by . ! ?", () => {
    assert.equal(getWordStats("Hello world. How are you? Fine!").sentences, 3);
  });
  it("treats runs of punctuation as one sentence end", () => {
    assert.equal(getWordStats("Wow!!! Really?!").sentences, 2);
    assert.equal(getWordStats("Wait... what").sentences, 1);
  });
  it("does not treat a decimal point as a sentence end", () => {
    assert.equal(getWordStats("Pi is 3.14 roughly").sentences, 0);
  });
  it("splits words on any whitespace (tabs, newlines, multiple spaces)", () => {
    assert.equal(getWordStats("a\n\nb\t c   d").words, 4);
  });
  it("ignores leading/trailing whitespace for word count but not for character count", () => {
    const s = getWordStats("  hi  ");
    assert.equal(s.words, 1);
    assert.equal(s.characters, 6);
    assert.equal(s.noSpaces, 2);
  });
});

describe("getWordStats — empty input", () => {
  it("empty string gives all zeros", () => {
    assert.deepEqual(getWordStats(""), { words: 0, characters: 0, noSpaces: 0, sentences: 0, reading: 0 });
  });
  it("whitespace-only gives zero words/sentences/reading but counts characters", () => {
    assert.deepEqual(getWordStats("   \n "), { words: 0, characters: 5, noSpaces: 0, sentences: 0, reading: 0 });
  });
});

describe("getWordStats — reading time (200 words per minute, minimum 1)", () => {
  it("1 word -> 1 minute", () => assert.equal(getWordStats("kata").reading, 1));
  it("200 words -> 1 minute", () => assert.equal(getWordStats(words(200)).reading, 1));
  it("201 words -> 2 minutes", () => assert.equal(getWordStats(words(201)).reading, 2));
  it("400 words -> 2 minutes", () => assert.equal(getWordStats(words(400)).reading, 2));
  it("401 words -> 3 minutes", () => assert.equal(getWordStats(words(401)).reading, 3));
});

describe("getWordStats — edge cases", () => {
  it("counts characters as UTF-16 code units (an emoji counts as 2)", () => {
    assert.equal(getWordStats("🌏").characters, 2);
  });
  it("handles a very large input", () => {
    assert.equal(getWordStats(words(100000)).words, 100000);
  });
});

describe("getWordStats — KNOWN ISSUES (current behavior, may change in Task 2)", () => {
  it("abbreviations are counted as sentence ends ('Dr.' -> extra sentence)", () => {
    assert.equal(getWordStats("Dr. Smith went home. Ok?").sentences, 3);
  });
  it("text without closing punctuation has 0 sentences", () => {
    assert.equal(getWordStats("tanpa titik di akhir").sentences, 0);
  });
});
