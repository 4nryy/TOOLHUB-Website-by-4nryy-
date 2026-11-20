/**
 * Percentage Calculator logic ("X% of Y"). Pure function.
 * `locale` is optional; when omitted the runtime default locale is used, which is
 * the original behavior. Tests pass an explicit locale to stay deterministic.
 * Throws Error("Enter valid numbers in both fields.") when either value is not finite.
 */
export function calculatePercentageOf(base: string, percent: string, locale?: string): string {
  const b = Number(base);
  const p = Number(percent);
  if (!Number.isFinite(b) || !Number.isFinite(p)) throw new Error("Enter valid numbers in both fields.");
  return `${p}% of ${b} = ${(b * p / 100).toLocaleString(locale, { maximumFractionDigits: 6 })}`;
}
