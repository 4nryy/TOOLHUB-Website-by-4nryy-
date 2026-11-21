/**
 * Base64 helpers (UTF-8 safe). Pure functions: no React, no DOM-only APIs.
 *
 * Encoding always produces STANDARD Base64 (RFC 4648 §4, with "=" padding).
 *
 * Decoding accepts:
 *   - the standard alphabet  (A-Z a-z 0-9 + /)
 *   - the URL-safe alphabet  (A-Z a-z 0-9 - _)   (RFC 4648 §5)
 *   - missing padding        ("SGFsbw" is accepted like "SGFsbw==")
 *   - ASCII whitespace anywhere in the input (line-wrapped Base64 from emails/PEM-style blocks), and any whitespace
 *     around the whole input
 * and rejects:
 *   - characters outside both alphabets
 *   - mixing both alphabets in one string ("+" or "/" together with "-" or "_")
 *   - "=" anywhere except as 1-2 trailing padding characters, or wrong amount of padding
 *   - impossible lengths (a remainder of 1 character can never be valid)
 *   - bytes that are not valid UTF-8 text
 */

export const BASE64_INVALID_MESSAGE = "This is not valid Base64. Check for missing, extra or unsupported characters.";
export const BASE64_NOT_TEXT_MESSAGE = "This Base64 is valid, but it does not decode to readable UTF-8 text.";

export function base64Encode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

/** Throws Error(BASE64_INVALID_MESSAGE) for malformed Base64 and Error(BASE64_NOT_TEXT_MESSAGE) for non-UTF-8 bytes. */
export function base64Decode(value: string): string {
  // Ends: any Unicode whitespace is trimmed (as before). Inside: only ASCII whitespace (space, tab, CR, LF, FF) is ignored.
  const compact = value.trim().replace(/[ \t\n\r\f]+/g, "");
  const match = /^([A-Za-z0-9+/_-]*)(=*)$/.exec(compact);
  if (!match) throw new Error(BASE64_INVALID_MESSAGE);

  const [, body, padding] = match;
  const usesStandardSymbols = /[+/]/.test(body);
  const usesUrlSafeSymbols = /[-_]/.test(body);
  if (usesStandardSymbols && usesUrlSafeSymbols) throw new Error(BASE64_INVALID_MESSAGE);

  const remainder = body.length % 4;
  if (remainder === 1) throw new Error(BASE64_INVALID_MESSAGE);
  // When padding is present it must be exactly what completes the last group of 4.
  if (padding.length > 0 && (remainder === 0 || padding.length !== 4 - remainder)) {
    throw new Error(BASE64_INVALID_MESSAGE);
  }

  const standard = body.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - remainder) % 4);
  let binary: string;
  try {
    binary = atob(standard);
  } catch {
    throw new Error(BASE64_INVALID_MESSAGE);
  }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(BASE64_NOT_TEXT_MESSAGE);
  }
}
