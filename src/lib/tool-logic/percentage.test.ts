import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculatePercentageOf } from "./percentage";

const calc = (base: string, percent: string) => calculatePercentageOf(base, percent, "en-US");
const INVALID = { message: "Enter valid numbers in both fields." };

describe("calculatePercentageOf — normal behavior", () => {
  it("15% of 200", () => assert.equal(calc("200", "15"), "15% of 200 = 30"));
  it("15% of 100", () => assert.equal(calc("100", "15"), "15% of 100 = 15"));
  it("decimal inputs", () => assert.equal(calc("33.3", "10"), "10% of 33.3 = 3.33"));
  it("0% and 0 base", () => {
    assert.equal(calc("100", "0"), "0% of 100 = 0");
    assert.equal(calc("0", "50"), "50% of 0 = 0");
  });
  it("percentages above 100", () => assert.equal(calc("50", "150"), "150% of 50 = 75"));
  it("negative numbers", () => assert.equal(calc("-200", "15"), "15% of -200 = -30"));
  it("groups thousands for the chosen locale", () => assert.equal(calc("1000000", "50"), "50% of 1000000 = 500,000"));
  it("rounds the result to at most 6 decimals", () => assert.equal(calc("1", "33.3333333"), "33.3333333% of 1 = 0.333333"));
  it("floating-point noise does not leak into the output", () => assert.equal(calc("0.1", "3"), "3% of 0.1 = 0.003"));
});

describe("calculatePercentageOf — invalid input", () => {
  it("throws for non-numeric base", () => assert.throws(() => calc("abc", "15"), INVALID));
  it("throws for non-numeric percent", () => assert.throws(() => calc("100", "abc"), INVALID));
  it("throws for Infinity and NaN", () => {
    assert.throws(() => calc("Infinity", "10"), INVALID);
    assert.throws(() => calc("100", "NaN"), INVALID);
    assert.throws(() => calc("1e999", "10"), INVALID);
  });
});

describe("calculatePercentageOf — KNOWN ISSUES (current behavior, may change in Task 2)", () => {
  it("empty or blank fields are treated as 0 instead of being rejected", () => {
    assert.equal(calc("", "15"), "15% of 0 = 0");
    assert.equal(calc("200", ""), "0% of 200 = 0");
    assert.equal(calc("  ", "  "), "0% of 0 = 0");
  });
});
