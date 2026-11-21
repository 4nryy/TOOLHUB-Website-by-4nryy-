import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BASE64_INVALID_MESSAGE, BASE64_NOT_TEXT_MESSAGE, base64Decode, base64Encode } from "./base64";

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
  it("accepts input without padding", () => {
    assert.equal(base64Decode("SGFsbw"), "Halo");
  });
  it("accepts ASCII whitespace inside the input", () => {
    assert.equal(base64Decode("SGFs\nbG8="), "Hallo");
  });
});


// Node's Buffer is an independent reference implementation of standard and URL-safe Base64.
const SAMPLES = [
  "", "a", "ab", "abc", "abcd", "abcde", "Hello", "Halo dunia 🌏 é — 日本語", ">>>", "?>?>", "~~~???",
  "line1\nline2\r\n", "😀".repeat(50), "x".repeat(1000), "ÿþ",
];
const toStandard = (text: string) => Buffer.from(text, "utf8").toString("base64");
const toUrlSafe = (text: string) => Buffer.from(text, "utf8").toString("base64url"); // unpadded
const toUrlSafePadded = (text: string) => toUrlSafe(text) + "=".repeat((4 - (toUrlSafe(text).length % 4)) % 4);

describe("base64Encode — still produces standard, padded Base64", () => {
  it("matches the reference implementation for every sample", () => {
    for (const text of SAMPLES) assert.equal(base64Encode(text), toStandard(text), JSON.stringify(text));
  });
  it("never emits URL-safe characters", () => {
    assert.equal(base64Encode(">>>"), "Pj4+");
    assert.equal(base64Encode("?>?>"), "Pz4/Pg==");
    assert.ok(!/[-_]/.test(base64Encode("~~~???")));
  });
});

describe("base64Decode — standard and URL-safe alphabets", () => {
  it("decodes standard Base64 (with '+' and '/')", () => {
    assert.equal(base64Decode("Pj4+"), ">>>");
    assert.equal(base64Decode("Pz4/Pg=="), "?>?>");
  });
  it("decodes URL-safe Base64 (with '-' and '_')", () => {
    assert.equal(base64Decode("Pj4-"), ">>>");
    assert.equal(base64Decode("Pz4_Pg"), "?>?>");
    assert.equal(base64Decode("8J-Mjw"), "🌏");
  });
  it("decodes every sample from standard, URL-safe unpadded and URL-safe padded forms", () => {
    for (const text of SAMPLES) {
      assert.equal(base64Decode(toStandard(text)), text, `standard: ${JSON.stringify(text)}`);
      assert.equal(base64Decode(toUrlSafe(text)), text, `url-safe: ${JSON.stringify(text)}`);
      assert.equal(base64Decode(toUrlSafePadded(text)), text, `url-safe padded: ${JSON.stringify(text)}`);
    }
  });
  it("decodes a real JWT header and payload (URL-safe, unpadded)", () => {
    assert.equal(base64Decode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"), '{"alg":"HS256","typ":"JWT"}');
    assert.equal(
      base64Decode("eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"),
      '{"sub":"1234567890","name":"John Doe","iat":1516239022}',
    );
  });
  it("round-trips Unicode through encode then decode", () => {
    for (const text of SAMPLES) assert.equal(base64Decode(base64Encode(text)), text);
  });
});

describe("base64Decode — padding", () => {
  it("accepts every missing-padding length (0, 1 and 2 omitted '=' characters)", () => {
    assert.equal(base64Decode("YWJj"), "abc");      // 0 omitted
    assert.equal(base64Decode("YWI"), "ab");        // 1 omitted
    assert.equal(base64Decode("YQ"), "a");          // 2 omitted
  });
  it("accepts correct padding", () => {
    assert.equal(base64Decode("YWI="), "ab");
    assert.equal(base64Decode("YQ=="), "a");
  });
  it("rejects too little, too much, misplaced or useless padding", () => {
    for (const bad of ["YQ=", "YWI==", "YWJj=", "YWJj====", "Y=Q=", "YQ==x", "=", "===="]) {
      assert.throws(() => base64Decode(bad), { message: BASE64_INVALID_MESSAGE }, JSON.stringify(bad));
    }
    assert.throws(() => base64Decode("YQ==="), { message: BASE64_INVALID_MESSAGE });
  });
});

describe("base64Decode — malformed input is rejected with a clear message", () => {
  it("rejects a final group of a single character (impossible length)", () => {
    for (const bad of ["A", "YWJjZ", "YWJjZGVmZ"]) {
      assert.throws(() => base64Decode(bad), { message: BASE64_INVALID_MESSAGE }, bad);
    }
  });
  it("rejects characters outside both alphabets", () => {
    for (const bad of ["YW*j", "YW.j", "YW j!", "YWé=", "YW\u00a0Jj", "Y W$", "<b>", "data:text/plain;base64,YQ=="]) {
      assert.throws(() => base64Decode(bad), { message: BASE64_INVALID_MESSAGE }, JSON.stringify(bad));
    }
  });
  it("rejects mixing the standard and URL-safe alphabets in one string", () => {
    assert.throws(() => base64Decode("ab+c-d=="), { message: BASE64_INVALID_MESSAGE });
    assert.throws(() => base64Decode("a/b_"), { message: BASE64_INVALID_MESSAGE });
  });
  it("reports valid Base64 that is not UTF-8 text with a different message", () => {
    assert.throws(() => base64Decode("gA=="), { message: BASE64_NOT_TEXT_MESSAGE });  // lone 0x80
    assert.throws(() => base64Decode("/w=="), { message: BASE64_NOT_TEXT_MESSAGE });  // 0xFF
    assert.throws(() => base64Decode("_w"), { message: BASE64_NOT_TEXT_MESSAGE });    // 0xFF, URL-safe, unpadded
  });
  it("treats empty and whitespace-only input as empty text", () => {
    assert.equal(base64Decode(""), "");
    assert.equal(base64Decode("  \n\t "), "");
  });
  it("trims any Unicode whitespace around the input (e.g. a non-breaking space from a web page)", () => {
    assert.equal(base64Decode("\u00a0YWJj\u00a0"), "abc");
    assert.equal(base64Decode("\uFEFFYWJj"), "abc");
  });
  it("ignores line-wrapped input (spaces, tabs, CR/LF)", () => {
    assert.equal(base64Decode("SGVs\r\nbG8g\n d29y\tbGQ="), "Hello world");
  });
});
