/**
 * Date Calculator logic (difference in calendar days). Pure functions.
 * Dates are parsed as UTC midnight (YYYY-MM-DD from <input type="date">).
 */

/** Signed whole-day difference (end - start). NaN when a date string is invalid. */
export function diffInDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

/** Throws Error("Choose both dates first.") when either date is empty. */
export function calculateDateDifference(startDate: string, endDate: string, locale?: string): string {
  if (!startDate || !endDate) throw new Error("Choose both dates first.");
  const diff = diffInDays(startDate, endDate);
  return `${Math.abs(diff).toLocaleString(locale)} days${diff < 0 ? " (the end date is before the start date)" : ""}`;
}
