import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatBytes } from "./format-bytes";

describe("formatBytes", () => {
  it("0 bytes", () => assert.equal(formatBytes(0), "0 B"));
  it("below 1 KB", () => assert.equal(formatBytes(1023), "1023 B"));
  it("exactly 1 KB", () => assert.equal(formatBytes(1024), "1.0 KB"));
  it("fractional KB", () => assert.equal(formatBytes(1536), "1.5 KB"));
  it("exactly 1 MB", () => assert.equal(formatBytes(1048576), "1.00 MB"));
  it("fractional MB", () => assert.equal(formatBytes(1500000), "1.43 MB"));
  it("large MB value", () => assert.equal(formatBytes(5 * 1024 * 1024), "5.00 MB"));
  it("rounding just below 1 MB shows '1024.0 KB' (current behavior)", () => {
    assert.equal(formatBytes(1048575), "1024.0 KB");
  });
});
