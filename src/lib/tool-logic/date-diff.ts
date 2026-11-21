/**
 * Date Calculator logic (difference in whole calendar days). Pure functions.
 *
 * Input format: strict ISO calendar date "YYYY-MM-DD" (what <input type="date"> produces; 4 to 6 digit years).
 * Impossible dates are rejected instead of being silently rolled over by `Date`
 * ("2026-02-30" is NOT accepted as March 2nd). Dates are interpreted at UTC midnight, so the result does not
 * depend on the viewer's time zone or on daylight-saving changes.
 */

export const DATE_EMPTY_MESSAGE = "Choose both dates first.";

const ISO_DATE_RE = /^(\d{4,6})-(\d{2})-(\d{2})$/;

/**
 * Milliseconds at UTC midnight for a real calendar date, or null when the text is not a valid
 * "YYYY-MM-DD" date (wrong format, month 13, Feb 30, Feb 29 in a non-leap year, year out of range).
 */
export function parseIsoDate(value: string): number | null {
  const match = ISO_DATE_RE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  // setUTCFullYear (not Date.UTC) so years 0-99 are not remapped to 1900-1999.
  date.setUTCFullYear(year, month - 1, day);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;
  const isSameDate = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isSameDate ? time : null;
}

/** Signed whole-day difference (end - start). Throws RangeError when either date is not a valid "YYYY-MM-DD" date. */
export function diffInDays(startDate: string, endDate: string): number {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (start === null) throw new RangeError("The start date is not a valid date.");
  if (end === null) throw new RangeError("The end date is not a valid date.");
  return Math.round((end - start) / 86400000);
}

/**
 * Throws Error("Choose both dates first.") when either date is empty, and Error("The start date is not a valid
 * date.") / Error("The end date is not a valid date.") when one is malformed or impossible.
 */
export function calculateDateDifference(startDate: string, endDate: string, locale?: string): string {
  if (!startDate || !endDate) throw new Error(DATE_EMPTY_MESSAGE);
  const diff = diffInDays(startDate, endDate);
  const days = Math.abs(diff);
  return `${days.toLocaleString(locale)} ${days === 1 ? "day" : "days"}${diff < 0 ? " (the end date is before the start date)" : ""}`;
}
