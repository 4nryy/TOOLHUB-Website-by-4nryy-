import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DATE_EMPTY_MESSAGE, calculateDateDifference, diffInDays, parseIsoDate } from "./date-diff";

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


describe("calculateDateDifference — singular and plural", () => {
  it("uses '1 day' for exactly one day", () => assert.equal(calc("2026-11-19", "2026-11-20"), "1 day"));
  it("uses 'days' for 0 and for 2 or more", () => {
    assert.equal(calc("2026-11-19", "2026-11-19"), "0 days");
    assert.equal(calc("2026-11-19", "2026-11-21"), "2 days");
    assert.equal(calc("2026-01-01", "2028-09-27"), "1,000 days");
  });
  it("keeps the singular form when the end date is one day before the start", () => {
    assert.equal(calc("2026-11-20", "2026-11-19"), "1 day (the end date is before the start date)");
  });
});

describe("parseIsoDate", () => {
  it("returns UTC midnight milliseconds for valid dates", () => {
    assert.equal(parseIsoDate("1970-01-01"), 0);
    assert.equal(parseIsoDate("1970-01-02"), 86400000);
    assert.equal(parseIsoDate("1969-12-31"), -86400000);
    assert.equal(parseIsoDate("2026-11-19"), Date.UTC(2026, 10, 19));
  });
  it("accepts real leap days and rejects fake ones", () => {
    for (const ok of ["2000-02-29", "2024-02-29", "2028-02-29", "1600-02-29"]) assert.notEqual(parseIsoDate(ok), null, ok);
    for (const bad of ["2026-02-29", "2100-02-29", "1900-02-29", "2027-02-29"]) assert.equal(parseIsoDate(bad), null, bad);
  });
  it("rejects impossible calendar dates instead of rolling them over", () => {
    for (const bad of ["2026-02-30", "2026-02-31", "2026-04-31", "2026-06-31", "2026-09-31", "2026-11-31", "2026-01-32", "2026-01-00", "2026-00-10", "2026-13-01", "2026-99-99"]) {
      assert.equal(parseIsoDate(bad), null, bad);
    }
  });
  it("accepts months with 31 days on day 31", () => {
    for (const month of ["01", "03", "05", "07", "08", "10", "12"]) assert.notEqual(parseIsoDate(`2026-${month}-31`), null, month);
  });
  it("rejects anything that is not strict YYYY-MM-DD", () => {
    for (const bad of ["", " ", "2026-1-1", "2026-01-1", "26-01-01", "2026/01/01", "01-01-2026", "2026-01-01T00:00:00Z", " 2026-01-01", "2026-01-01 ",
      "2026-01-01\n", "20260101", "2026-01", "-2026-01-01", "+2026-01-01", "２０２６-01-01", "2026-٠١-٠١", "abc", "null", "NaN-NaN-NaN"]) {
      assert.equal(parseIsoDate(bad), null, JSON.stringify(bad));
    }
  });
  it("handles years 0-99 correctly (they are not remapped to 1900-1999)", () => {
    assert.equal(diffInDays("0001-01-01", "0001-01-03"), 2);
    assert.equal(diffInDays("0099-12-31", "0100-01-01"), 1);
    assert.equal(diffInDays("0000-01-01", "0001-01-01"), 366); // year 0 is a leap year in the proleptic Gregorian calendar
  });
  it("supports 5 and 6 digit years up to the JavaScript Date limit and rejects beyond it", () => {
    assert.notEqual(parseIsoDate("10000-01-01"), null);
    assert.notEqual(parseIsoDate("275760-09-13"), null);
    assert.equal(parseIsoDate("275760-09-14"), null);
    assert.equal(parseIsoDate("999999-01-01"), null);
    assert.equal(parseIsoDate("1000000-01-01"), null); // 7 digits
  });
  it("round-trips every day from 1999-01-01 to 2030-12-31 without rollover (11,688 days)", () => {
    const start = Date.UTC(1999, 0, 1);
    for (let i = 0; i < 11688; i++) {
      const date = new Date(start + i * 86400000);
      const iso = date.toISOString().slice(0, 10);
      assert.equal(parseIsoDate(iso), date.getTime(), iso);
      if (i > 0) assert.equal(diffInDays(new Date(start + (i - 1) * 86400000).toISOString().slice(0, 10), iso), 1, iso);
    }
  });
});

describe("calculateDateDifference — invalid dates", () => {
  const START_INVALID = { message: "The start date is not a valid date." };
  const END_INVALID = { message: "The end date is not a valid date." };
  it("rejects an impossible start or end date", () => {
    assert.throws(() => calc("2026-02-30", "2026-03-01"), START_INVALID);
    assert.throws(() => calc("2026-03-01", "2026-02-30"), END_INVALID);
    assert.throws(() => calc("2027-02-29", "2027-03-01"), START_INVALID);
  });
  it("rejects malformed dates and never prints NaN", () => {
    for (const bad of ["not-a-date", "2026-13-45", "2026-1-1", "2026/01/01", "2026-01-01T10:00", " "]) {
      assert.throws(() => calc(bad, "2026-11-19"), START_INVALID, bad);
      assert.throws(() => calc("2026-11-19", bad), END_INVALID, bad);
    }
  });
  it("reports the start date first when both are invalid", () => {
    assert.throws(() => calc("bad", "worse"), START_INVALID);
  });
  it("reports empty input before invalid input", () => {
    assert.throws(() => calc("", "bad"), { message: DATE_EMPTY_MESSAGE });
    assert.throws(() => calc("bad", ""), { message: DATE_EMPTY_MESSAGE });
  });
  it("diffInDays throws RangeError (not NaN) for invalid dates", () => {
    assert.throws(() => diffInDays("2026-02-30", "2026-03-01"), RangeError);
    assert.throws(() => diffInDays("2026-03-01", "nope"), RangeError);
  });
});

describe("calculateDateDifference — invalid ranges", () => {
  it("allows a reversed range but flags it", () => {
    assert.equal(calc("2026-12-31", "2026-01-01"), "364 days (the end date is before the start date)");
  });
  it("handles the extremes of the supported range", () => {
    // Hand-computed: leap years in 0000..9999 = 2500 (div. by 4) - 100 (by 100) + 25 (by 400) = 2425,
    // so 0000-01-01 -> 10000-01-01 is 10000*365 + 2425 = 3,652,425 days, and one day less to 9999-12-31.
    assert.equal(calc("0000-01-01", "9999-12-31"), "3,652,424 days");
    assert.equal(calc("275760-09-13", "275760-09-12"), "1 day (the end date is before the start date)");
  });
});
