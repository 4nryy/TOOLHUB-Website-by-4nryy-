/** UUID Generator logic. */

/** Clamp the requested count to 1..100; non-numeric input becomes 1. */
export function clampUuidCount(value: string | number): number {
  return Math.min(100, Math.max(1, Number(value) || 1));
}

/** `create` is injectable for tests; defaults to crypto.randomUUID (secure contexts only in browsers). */
export function generateUuids(count: number, create: () => string = () => crypto.randomUUID()): string[] {
  return Array.from({ length: count }, () => create());
}
