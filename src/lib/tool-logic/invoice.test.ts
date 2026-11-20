import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateInvoiceTotal } from "./invoice";

describe("calculateInvoiceTotal", () => {
  it("multiplies quantity by unit price", () => assert.equal(calculateInvoiceTotal("2", "150000"), 300000));
  it("uses the default form values (1 x 150000)", () => assert.equal(calculateInvoiceTotal("1", "150000"), 150000));
  it("supports decimal quantities", () => assert.equal(calculateInvoiceTotal("1.5", "100000"), 150000));
  it("is 0 when quantity or price is 0", () => {
    assert.equal(calculateInvoiceTotal("0", "150000"), 0);
    assert.equal(calculateInvoiceTotal("3", "0"), 0);
  });
  it("treats empty and non-numeric input as 0", () => {
    assert.equal(calculateInvoiceTotal("", "150000"), 0);
    assert.equal(calculateInvoiceTotal("2", ""), 0);
    assert.equal(calculateInvoiceTotal("abc", "150000"), 0);
    assert.equal(calculateInvoiceTotal("2", "abc"), 0);
  });
  it("never returns a negative total", () => {
    assert.equal(calculateInvoiceTotal("-2", "150000"), 0);
    assert.equal(calculateInvoiceTotal("2", "-150000"), 0);
    assert.equal(calculateInvoiceTotal("-2", "-150000"), 0);
  });
  it("handles large amounts", () => assert.equal(calculateInvoiceTotal("1000", "999999999"), 999999999000));
  it("floating-point result is approximately right (display rounds to whole IDR)", () => {
    assert.ok(Math.abs(calculateInvoiceTotal("3", "0.1") - 0.3) < 1e-9);
  });
});
