/**
 * Percentage Calculator logic ("X% of Y"). Pure functions.
 *
 * Validation distinguishes three different situations:
 *   1. EMPTY   — the field is blank (or only spaces)          -> "Enter ..." message, never treated as 0
 *   2. INVALID — not a plain decimal number                    -> "Enter valid numbers in both fields."
 *   3. ZERO    — a legitimate "0" / "0.0" / "-0"               -> accepted and calculated
 *
 * A "plain decimal number" is: optional sign, digits with an optional decimal point, optional exponent
 * ("15", "-3.5", ".5", "1e3"). Hexadecimal/binary/octal forms ("0x10"), "Infinity", "NaN", digit
 * separators ("1,000", "1_000") and comma decimals ("15,5") are INVALID. <input type="number"> already
 * normalizes locale decimals to "15.5" before they reach this module.
 *
 * `locale` is optional; when omitted the runtime default locale formats the result.
 */

export const PERCENTAGE_INVALID_MESSAGE = "Enter valid numbers in both fields.";
export const PERCENTAGE_BOTH_EMPTY_MESSAGE = "Enter a percentage and a number.";
export const PERCENTAGE_PERCENT_EMPTY_MESSAGE = "Enter a percentage.";
export const PERCENTAGE_BASE_EMPTY_MESSAGE = "Enter a number to calculate the percentage of.";
export const PERCENTAGE_TOO_LARGE_MESSAGE = "The result is too large to display.";

const DECIMAL_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

/** Returns the number for a plain decimal string, or null when the text is not one (blank included). */
export function parseDecimalInput(text: string): number | null {
  const trimmed = text.trim();
  if (!DECIMAL_RE.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/** Throws Error with one of the PERCENTAGE_* messages for empty, invalid or overflowing input. */
export function calculatePercentageOf(base: string, percent: string, locale?: string): string {
  const baseEmpty = base.trim() === "";
  const percentEmpty = percent.trim() === "";
  if (baseEmpty && percentEmpty) throw new Error(PERCENTAGE_BOTH_EMPTY_MESSAGE);
  if (percentEmpty) throw new Error(PERCENTAGE_PERCENT_EMPTY_MESSAGE);
  if (baseEmpty) throw new Error(PERCENTAGE_BASE_EMPTY_MESSAGE);

  const b = parseDecimalInput(base);
  const p = parseDecimalInput(percent);
  if (b === null || p === null) throw new Error(PERCENTAGE_INVALID_MESSAGE);

  const result = (b * p) / 100;
  if (!Number.isFinite(result)) throw new Error(PERCENTAGE_TOO_LARGE_MESSAGE);
  // Anything that rounds to zero at 6 decimals is shown as plain "0" (never "-0").
  const shown = Math.abs(result) < 0.0000005 ? 0 : result;
  return `${p}% of ${b} = ${shown.toLocaleString(locale, { maximumFractionDigits: 6 })}`;
}
