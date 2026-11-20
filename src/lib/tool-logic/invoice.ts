/** Invoice Generator logic: total = max(0, quantity) * max(0, unit price); invalid numbers count as 0. */
export function calculateInvoiceTotal(quantity: string, unitPrice: string): number {
  return Math.max(0, Number(quantity) || 0) * Math.max(0, Number(unitPrice) || 0);
}
