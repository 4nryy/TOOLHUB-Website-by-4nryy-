/**
 * JSON Formatter logic. Pure function.
 * mode: "minify" | "2" | "4" (indent width; anything non-numeric falls back to 2).
 * Throws the engine's SyntaxError for invalid JSON.
 */
export function formatJson(input: string, mode: string): string {
  const parsed = JSON.parse(input);
  return mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, Number(mode) || 2);
}
