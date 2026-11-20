import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateDateDifference, diffInDays } from "./date-diff";

const calc = (a: string, b: string) => calculateDateDifference(a, b, "en-US");
const EMPTY = { message: "Choose both dates first." };

describe("diffInDays", () => {
  it("is 0 for the same date", () => assert.equal(diffInDays("2026-11-19", "2026-11-19"), 0));
  it("is positive when end is after start", () => assert.equal(diffInDays("2026-11-19", "2026-11-29"), 10));
  it("is negative when end is before start", () => assert.equal(diffInDays("2026-11-29", "2026-11-19"), -10));
  it("crosses a month and a year boundary", () => {
    assert.equal(diffInDays("2026-01-31", "2026-02-01"), 1);
    assert.equal(diffInDays("2026-12-31", "2027-01-01"), 1);
  });
  it("accounts for leap years", () => {
    assert.equal(diffInDays("2028-02-28", "2028-03-01"), 2); // 2028 is a leap year
    assert.equal(diffInDays("2027-02-28", "2027-03-01"), 1);
    assert.equal(diffInDays("2026-11-19", "2027-11-19"), 365);
    assert.equal(diffInDays("2027-11-19", "2028-11-19"), 366);
  });
  it("is not affected by daylight-saving changes (dates are parsed as UTC)", () => {
    assert.equal(diffInDays("2026-03-28", "2026-03-30"), 2);
    assert.equal(diffInDays("2026-10-24", "2026-10-26"), 2);
  });
  it("handles a long range (hand-computed: 26 years + 7 leap days + 322 days)", () => {
    assert.equal(diffInDays("2000-01-01", "2026-11-19"), 9819);
  });
});

describe("calculateDateDifference — normal behavior", () => {
  it("formats a forward difference", () => assert.equal(calc("2026-11-19", "2026-11-29"), "10 days"));
  it("formats zero", () => assert.equal(calc("2026-11-19", "2026-11-19"), "0 days"));
  it("adds a note when the end date is before the start date", () => {
    assert.equal(calc("2026-11-19", "2026-11-10"), "9 days (the end date is before the start date)");
  });
  it("groups thousands for the chosen locale", () => assert.equal(calc("2000-01-01", "2026-11-19"), "9,819 days"));
});

describe("calculateDateDifference — empty input", () => {
  it("throws when the start date is empty", () => assert.throws(() => calc("", "2026-11-19"), EMPTY));
  it("throws when the end date is empty", () => assert.throws(() => calc("2026-11-19", ""), EMPTY));
  it("throws when both are empty", () => assert.throws(() => calc("", ""), EMPTY));
});

describe("calculateDateDifference — KNOWN ISSUES (current behavior, may change in Task 2)", () => {
  it("an unparseable date yields 'NaN days' instead of an error", () => {
    assert.equal(calc("2026-13-45", "2026-11-19"), "NaN days");
    assert.equal(calc("not-a-date", "2026-11-19"), "NaN days");
  });
  it("uses the plural 'days' even for 1 day", () => assert.equal(calc("2026-11-19", "2026-11-20"), "1 days"));
});
