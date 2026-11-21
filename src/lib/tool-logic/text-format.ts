/**
 * Text Formatter logic. Pure function.
 * Modes: "uppercase" | "lowercase" | "title" | "sentence" | "trim" | "spaces".
 * Any unknown mode falls back to "spaces" (normalize whitespace).
 *
 * MODES
 *  - uppercase / lowercase : plain Unicode-aware case conversion.
 *  - title    : first character of every whitespace-separated word is upper-cased, the rest lower-cased.
 *  - sentence : first letter of the text and of every sentence (after . ! ? + whitespace) is upper-cased,
 *               everything else lower-cased. Unicode letters are supported ("étude. égal" -> "Étude. Égal").
 *  - trim     : removes whitespace at the start and end of EVERY LINE only. Spaces and tabs inside a line
 *               are left untouched. Line breaks are kept (a Windows "\r\n" becomes "\n").
 *  - spaces   : trims the whole text and collapses every run of whitespace (including line breaks) to one space.
 *
 * ACRONYMS (title and sentence modes)
 * Lower-casing a whole text would turn "HTML" into "Html". Words that appear in KNOWN_ACRONYMS (a short,
 * deliberately small list of common technical, organization and Indonesian abbreviations) are therefore kept
 * exactly as they are, including a trailing number ("HTML5", "UUID4").
 * Limits of this approach (by design, to stay simple and predictable):
 *  - Only upper-case spellings of listed words are protected: "api" typed in lower case becomes "Api" in title
 *    case, and nothing is ever promoted to upper case.
 *  - An acronym that is not in the list is lower-cased like any other word ("ACME" -> "Acme").
 *    Add it to KNOWN_ACRONYMS if needed.
 *  - Ordinary words typed in capitals are still normalized ("how ARE you" -> "how are you").
 *  - Dotted abbreviations such as "U.S.A." are not treated specially.
 *  - Case conversion uses the default Unicode rules: "ß" upper-cases to "SS", and the Turkish dotted/dotless "i"
 *    is not locale-aware.
 */
export type TextFormatMode = "uppercase" | "lowercase" | "title" | "sentence" | "trim" | "spaces";

/**
 * Words (always upper case) that title/sentence case leave untouched.
 * Deliberately excludes abbreviations that are also ordinary words when written in capitals
 * (IT, US, ID, OK, IS, AS, OR, WHO, WIT, ...), because protecting them would break normal all-caps text.
 */
export const KNOWN_ACRONYMS: ReadonlySet<string> = new Set([
  // Technology
  "AI", "API", "CLI", "CPU", "CSS", "CSV", "DNS", "FTP", "GIF", "GPU", "GUI", "HTML", "HTTP", "HTTPS", "IDE", "IP",
  "JPEG", "JPG", "JS", "JSON", "OS", "PDF", "PNG", "RAM", "SDK", "SQL", "SSH", "SVG", "TCP", "TS", "UDP", "UI",
  "URI", "URL", "USB", "UUID", "UX", "XML", "YAML",
  // General / organizations / places
  "ASEAN", "CEO", "CIA", "EU", "FAQ", "FBI", "NASA", "NATO", "UK", "UN", "USA",
  // Indonesian
  "BPJS", "BUMN", "CV", "DPR", "KTP", "NIK", "NPWP", "PT", "RI", "SIM", "TNI", "UMKM", "WIB", "WITA",
]);

const WORD_RUN = /[\p{L}\p{M}\p{N}]+/gu;

function isKnownAcronym(run: string): boolean {
  return KNOWN_ACRONYMS.has(run) || KNOWN_ACRONYMS.has(run.replace(/\p{N}+$/u, ""));
}

/** Lower-cases the text except for words in KNOWN_ACRONYMS. */
function lowerCasePreservingAcronyms(input: string): string {
  return input.replace(WORD_RUN, (run) => (isKnownAcronym(run) ? run : run.toLowerCase()));
}

export function formatText(input: string, mode: string): string {
  if (mode === "uppercase") return input.toUpperCase();
  if (mode === "lowercase") return input.toLowerCase();
  if (mode === "title") {
    return lowerCasePreservingAcronyms(input).replace(/(^|\s)(\S)/gu, (_match, before: string, first: string) => before + first.toUpperCase());
  }
  if (mode === "sentence") {
    return lowerCasePreservingAcronyms(input).replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_match, before: string, letter: string) => before + letter.toUpperCase());
  }
  if (mode === "trim") return input.split("\n").map((line) => line.trim()).join("\n");
  return input.trim().replace(/\s+/g, " ");
}
