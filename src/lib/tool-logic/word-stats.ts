/**
 * Word Counter logic. Pure function.
 *
 * WORDS
 * Text is split on whitespace. A token counts as a word only if it contains at least one letter, digit or emoji,
 * so stand-alone punctuation such as "-", "—", "&", "..." or "•" is NOT counted ("Hello — world" = 2 words).
 * Hyphenated and dotted tokens stay ONE word ("state-of-the-art", "e.g.", "3.14").
 *
 * SENTENCES
 * A sentence end is a run of . ! ? (optionally followed by closing quotes/brackets) that is followed by
 * whitespace or the end of the text. "!" and "?" runs and ellipses ("...") always end a sentence. A SINGLE period
 * is ignored when it belongs to an abbreviation:
 *   - titles and fixed expressions that are always followed by more text:
 *       Mr, Mrs, Ms, Dr, Prof, Sr, Jr, St, Mt, vs, cf, e.g, i.e  (Indonesian: Ir, Hj, Bpk, Jl)
 *   - labels followed by a number ("No. 5", "hlm. 10", "Fig. 3", "vol. 2")
 *   - a single capital letter used as an initial ("J. K. Rowling")
 *   - "soft" abbreviations (etc, dll, dsb, dst, dkk, Inc, Ltd, Co, Corp, ms as a unit, ...) which end a sentence only when the next
 *     word starts with a capital letter
 *   - dotted letter abbreviations ("U.S.A.", "a.m.") which end a sentence only when the next word starts with a capital
 *     letter and the abbreviation is not one of the fixed expressions above
 * A terminator that is closed by a quote or bracket and followed by a lowercase word is a dialogue tag, not a sentence end
 * ("Really?" she asked. = 1 sentence).
 * A period that is the very last thing in the text always counts. Decimals ("3.14"), versions and domain names have no
 * whitespace after the period, so they are never sentence ends.
 *
 * Known limits (kept simple on purpose, this is not NLP):
 *   - Text WITHOUT closing punctuation is not counted as a sentence ("Hello world" = 0, "One. Two" = 1).
 *     This is unchanged, pre-existing behavior; whether to count a trailing unpunctuated sentence is a product decision.
 *   - Abbreviations that are not in the lists above are treated as sentence ends.
 *   - A sentence that genuinely ends with a title-like abbreviation ("... asked for Mr. Next, ...") is not split.
 *   - "No." is only an abbreviation when a number follows ("No. 5"); as a word ("Ready? No. Not yet.") it ends a sentence.
 *   - A sentence that ends with a single capital letter ("Take vitamin C. Then rest.") is mistaken for an initial.
 */
export type WordStats = {
  words: number;
  characters: number;
  noSpaces: number;
  sentences: number;
  /** Estimated reading time in minutes (200 wpm, minimum 1 when there is text). */
  reading: number;
};

/** Always followed by more text, so a period after them never ends a sentence (unless it is the last character). */
const NON_TERMINATING = new Set([
  "mr", "mrs", "dr", "prof", "sr", "jr", "st", "mt", "vs", "cf", "e.g", "i.e",
  "ir", "hj", "bpk", "jl",
]);
/** Abbreviations that mean "label for a number"; not a sentence end when the next word is a number. */
const NUMBER_LABELS = new Set(["no", "nr", "hlm", "vol", "fig", "pp", "p", "bab", "pasal"]);
/** May end a sentence, but only when followed by a capitalized word. */
const SOFT = new Set(["ms", "etc", "dll", "dsb", "dst", "dkk", "tsb", "yg", "dgn", "hlm", "tgl", "inc", "ltd", "co", "corp", "approx", "est"]);

const WORD_CHAR = /[\p{L}\p{N}\p{Extended_Pictographic}]/u;
const WHITESPACE = /\s/;
const TERMINATOR = /[.!?]+["'”’»)\]]*(?=\s|$)/g;

function endsAtTextEnd(text: string, index: number): boolean {
  for (let i = index; i < text.length; i++) if (!WHITESPACE.test(text[i])) return false;
  return true;
}

function nextStartsWithDigit(text: string, index: number): boolean {
  let i = index;
  while (i < text.length && WHITESPACE.test(text[i])) i++;
  return i < text.length && /\p{N}/u.test(String.fromCodePoint(text.codePointAt(i) as number));
}

function nextStartsWithLowercase(text: string, index: number): boolean {
  let i = index;
  while (i < text.length && WHITESPACE.test(text[i])) i++;
  while (i < text.length && /["'“‘«(\[]/.test(text[i])) i++;
  return i < text.length && /\p{Ll}/u.test(String.fromCodePoint(text.codePointAt(i) as number));
}

function nextStartsWithCapital(text: string, index: number): boolean {
  let i = index;
  while (i < text.length && WHITESPACE.test(text[i])) i++;
  // skip opening quotes/brackets before the next word
  while (i < text.length && /["'“‘«(\[]/.test(text[i])) i++;
  return i < text.length && /\p{Lu}/u.test(String.fromCodePoint(text.codePointAt(i) as number));
}

/** The whitespace-delimited token that ends right before `index`, stripped of leading quotes/brackets. */
function tokenBefore(text: string, index: number): string {
  let start = index;
  while (start > 0 && !WHITESPACE.test(text[start - 1])) start--;
  return text.slice(start, index).replace(/^[^\p{L}\p{N}]+/u, "");
}

function isSentenceEnd(text: string, match: RegExpMatchArray): boolean {
  const run = match[0];
  const index = match.index as number;
  const afterRun = index + run.length;
  // A terminator closed by a quote/bracket and followed by a lowercase word is a dialogue tag: "Really?" she asked.
  if (/["'”’»)\]]$/.test(run) && nextStartsWithLowercase(text, afterRun)) return false;
  if (!/^\.["'”’»)\]]*$/.test(run)) return true; // contains ! or ? or is an ellipsis
  if (endsAtTextEnd(text, afterRun)) return true;

  const token = tokenBefore(text, index);
  const lower = token.toLowerCase();
  if (NON_TERMINATING.has(lower)) return false;
  if (token === "Ms") return false; // title "Ms." (capitalized); lowercase "ms" is the unit, see SOFT
  if (NUMBER_LABELS.has(lower) && nextStartsWithDigit(text, afterRun)) return false;
  if (/^\p{Lu}$/u.test(token)) return false; // initial: "J. K. Rowling"
  if (SOFT.has(lower)) return nextStartsWithCapital(text, afterRun);
  if (/^(?:\p{L}\.)+\p{L}$/u.test(token)) return nextStartsWithCapital(text, afterRun); // "U.S.A." / "a.m."
  return true;
}

export function getWordStats(input: string): WordStats {
  const trimmed = input.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter((token) => WORD_CHAR.test(token)).length : 0;
  let sentences = 0;
  if (trimmed) {
    for (const match of trimmed.matchAll(TERMINATOR)) if (isSentenceEnd(trimmed, match)) sentences++;
  }
  return {
    words,
    characters: input.length,
    noSpaces: input.replace(/\s/g, "").length,
    sentences,
    reading: words ? Math.max(1, Math.ceil(words / 200)) : 0,
  };
}
