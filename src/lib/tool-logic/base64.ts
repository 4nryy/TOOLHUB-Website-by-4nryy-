/**
 * Base64 helpers (UTF-8 safe). Pure functions: no React, no DOM-only APIs.
 * Behavior is intentionally identical to the original inline implementation
 * in ToolWorkspace.tsx (extracted in Task 1, no behavior change).
 */

export function base64Encode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

/** Throws if the input is not valid Base64 or does not decode to valid UTF-8. */
export function base64Decode(value: string): string {
  const binary = atob(value.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
