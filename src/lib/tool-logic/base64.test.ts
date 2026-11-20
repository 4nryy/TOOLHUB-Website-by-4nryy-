import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { base64Decode, base64Encode } from "./base64";

describe("base64Encode", () => {
  it("encodes plain ASCII", () => {
    assert.equal(base64Encode("Hello"), "SGVsbG8=");
  });
  it("returns an empty string for empty input", () => {
    assert.equal(base64Encode(""), "");
  });
  it("encodes non-ASCII text as UTF-8 (accents, emoji)", () => {
    assert.equal(base64Encode("é"), "w6k=");
    assert.equal(base64Encode("🌏"), "8J+Mjw==");
  });
  it("encodes whitespace and newlines faithfully", () => {
    assert.equal(base64Decode(base64Encode(" a\n\tb ")), " a\n\tb ");
  });
});

describe("base64Decode", () => {
  it("decodes valid Base64", () => {
    assert.equal(base64Decode("SGVsbG8="), "Hello");
  });
  it("returns an empty string for empty input", () => {
    assert.equal(base64Decode(""), "");
  });
  it("trims surrounding whitespace before decoding", () => {
    assert.equal(base64Decode("  SGVsbG8=\n"), "Hello");
  });
  it("round-trips UTF-8 text", () => {
    const text = "Halo dunia 🌏 é — 日本語";
    assert.equal(base64Decode(base64Encode(text)), text);
  });
  it("round-trips a long string", () => {
    const text = "abc123 ".repeat(5000);
    assert.equal(base64Decode(base64Encode(text)), text);
  });
  it("throws on characters outside the Base64 alphabet", () => {
    assert.throws(() => base64Decode("***not base64***"));
    assert.throws(() => base64Decode("SGVs$bG8="));
  });
  it("throws when the bytes are not valid UTF-8", () => {
    // "gA==" decodes to the single byte 0x80, which is invalid UTF-8.
    assert.throws(() => base64Decode("gA=="));
  });
  it("accepts input without padding (current engine behavior)", () => {
    assert.equal(base64Decode("SGFsbw"), "Halo");
  });
  it("accepts ASCII whitespace inside the input (current engine behavior)", () => {
    assert.equal(base64Decode("SGFs\nbG8="), "Hallo");
  });
});

describe("base64 — KNOWN ISSUES (current behavior, may change in Task 2)", () => {
  it("rejects URL-safe Base64 ('-' and '_'); only the standard alphabet is supported", () => {
    // "8J-Mjw" is the URL-safe, unpadded form of "🌏".
    assert.throws(() => base64Decode("8J-Mjw"));
  });
});
