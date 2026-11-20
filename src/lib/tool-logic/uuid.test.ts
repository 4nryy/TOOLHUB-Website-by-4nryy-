import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clampUuidCount, generateUuids } from "./uuid";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("clampUuidCount", () => {
  it("keeps values inside 1..100", () => {
    assert.equal(clampUuidCount("1"), 1);
    assert.equal(clampUuidCount("5"), 5);
    assert.equal(clampUuidCount("100"), 100);
    assert.equal(clampUuidCount(25), 25);
  });
  it("caps values above 100", () => {
    assert.equal(clampUuidCount("101"), 100);
    assert.equal(clampUuidCount("500"), 100);
  });
  it("raises zero and negatives to 1", () => {
    assert.equal(clampUuidCount("0"), 1);
    assert.equal(clampUuidCount("-5"), 1);
  });
  it("treats empty or non-numeric input as 1", () => {
    assert.equal(clampUuidCount(""), 1);
    assert.equal(clampUuidCount("abc"), 1);
    assert.equal(clampUuidCount(NaN), 1);
  });
});

describe("generateUuids", () => {
  it("returns the requested number of ids using the injected generator", () => {
    let n = 0;
    assert.deepEqual(generateUuids(3, () => `id-${++n}`), ["id-1", "id-2", "id-3"]);
  });
  it("returns an empty array for count 0", () => {
    assert.deepEqual(generateUuids(0), []);
  });
  it("default generator produces RFC 4122 version-4 UUIDs", () => {
    for (const id of generateUuids(20)) assert.match(id, UUID_V4);
  });
  it("default generator produces unique ids (100 samples)", () => {
    assert.equal(new Set(generateUuids(100)).size, 100);
  });
});
