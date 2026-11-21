import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PERCENTAGE_BASE_EMPTY_MESSAGE, PERCENTAGE_BOTH_EMPTY_MESSAGE, PERCENTAGE_INVALID_MESSAGE, PERCENTAGE_PERCENT_EMPTY_MESSAGE,
  PERCENTAGE_TOO_LARGE_MESSAGE, calculatePercentageOf, parseDecimalInput,
} from "./percentage";

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


describe("calculatePercentageOf — empty input is never silently 0", () => {
  it("asks for both values when both fields are empty", () => {
    assert.throws(() => calc("", ""), { message: PERCENTAGE_BOTH_EMPTY_MESSAGE });
  });
  it("asks for the percentage when only it is empty", () => {
    assert.throws(() => calc("200", ""), { message: PERCENTAGE_PERCENT_EMPTY_MESSAGE });
  });
  it("asks for the number when only it is empty", () => {
    assert.throws(() => calc("", "15"), { message: PERCENTAGE_BASE_EMPTY_MESSAGE });
  });
  it("treats blank (spaces/tabs/newlines only) fields as empty", () => {
    assert.throws(() => calc("  ", "  "), { message: PERCENTAGE_BOTH_EMPTY_MESSAGE });
    assert.throws(() => calc(" \t", "15"), { message: PERCENTAGE_BASE_EMPTY_MESSAGE });
    assert.throws(() => calc("200", "\n"), { message: PERCENTAGE_PERCENT_EMPTY_MESSAGE });
  });
  it("reports an empty field before an invalid one", () => {
    assert.throws(() => calc("abc", ""), { message: PERCENTAGE_PERCENT_EMPTY_MESSAGE });
    assert.throws(() => calc("", "abc"), { message: PERCENTAGE_BASE_EMPTY_MESSAGE });
  });
});

describe("calculatePercentageOf — a real zero is valid", () => {
  it("accepts 0 in either or both fields", () => {
    assert.equal(calc("0", "0"), "0% of 0 = 0");
    assert.equal(calc("0", "50"), "50% of 0 = 0");
    assert.equal(calc("100", "0"), "0% of 100 = 0");
  });
  it("accepts zero written as 0.0, 00 or -0 and never prints '-0'", () => {
    assert.equal(calc("0.0", "50"), "50% of 0 = 0");
    assert.equal(calc("00", "50"), "50% of 0 = 0");
    assert.equal(calc("-0", "50"), "50% of 0 = 0");
    assert.equal(calc("200", "-0"), "0% of 200 = 0");
  });
  it("shows a tiny negative result that rounds to zero as 0, not -0", () => {
    assert.equal(calc("1", "-0.00001"), "-0.00001% of 1 = 0");
  });
});

describe("calculatePercentageOf — invalid input", () => {
  it("rejects text that is not a plain decimal number", () => {
    for (const bad of ["abc", "1,000", "15,5", "0x10", "0b1", "1e", "e5", "--5", "5%", "1 2", "+", "-", ".", "1_000", "٣", "１５"]) {
      assert.throws(() => calc(bad, "15"), { message: PERCENTAGE_INVALID_MESSAGE }, `base ${JSON.stringify(bad)}`);
      assert.throws(() => calc("100", bad), { message: PERCENTAGE_INVALID_MESSAGE }, `percent ${JSON.stringify(bad)}`);
    }
  });
  it("rejects values that overflow to Infinity", () => {
    assert.throws(() => calc("1e999", "10"), { message: PERCENTAGE_INVALID_MESSAGE });
    assert.throws(() => calc("-1e999", "10"), { message: PERCENTAGE_INVALID_MESSAGE });
  });
  it("rejects a result that is too large to display", () => {
    assert.throws(() => calc("1e308", "1000"), { message: PERCENTAGE_TOO_LARGE_MESSAGE });
  });
});

describe("calculatePercentageOf — accepted number spellings", () => {
  it("accepts signs, leading/trailing dot, exponent and surrounding spaces", () => {
    assert.equal(calc("+200", "15"), "15% of 200 = 30");
    assert.equal(calc(".5", "50"), "50% of 0.5 = 0.25");
    assert.equal(calc("5.", "20"), "20% of 5 = 1");
    assert.equal(calc("1e3", "10"), "10% of 1000 = 100");
    assert.equal(calc("1E3", "10"), "10% of 1000 = 100");
    assert.equal(calc(" 12 ", " 50 "), "50% of 12 = 6");
  });
});

describe("parseDecimalInput", () => {
  it("returns the number for plain decimals", () => {
    assert.equal(parseDecimalInput("15"), 15);
    assert.equal(parseDecimalInput("-3.5"), -3.5);
    assert.equal(parseDecimalInput("  0  "), 0);
  });
  it("returns null for blank, malformed or non-finite text", () => {
    for (const bad of ["", "  ", "abc", "Infinity", "NaN", "0x10", "1e999"]) assert.equal(parseDecimalInput(bad), null, JSON.stringify(bad));
  });
});
