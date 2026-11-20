/**
 * Text Formatter logic. Pure function.
 * Supported modes: "uppercase" | "lowercase" | "title" | "sentence" | "trim" | "spaces".
 * Any unknown mode falls back to "spaces" (normalize whitespace), exactly like
 * the original else-branch in ToolWorkspace.tsx.
 */
export type TextFormatMode = "uppercase" | "lowercase" | "title" | "sentence" | "trim" | "spaces";

export function formatText(input: string, mode: string): string {
  if (mode === "uppercase") return input.toUpperCase();
  if (mode === "lowercase") return input.toLowerCase();
  if (mode === "title") return input.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
  if (mode === "sentence") return input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (letter) => letter.toUpperCase());
  if (mode === "trim") return input.split("\n").map((line) => line.trim()).join("\n").replace(/[ \t]{2,}/g, " ");
  return input.trim().replace(/\s+/g, " ");
}
