/**
 * JSON Formatter logic — lossless for numbers. Pure function, no dependencies.
 *
 * WHY A CUSTOM PARSER
 * `JSON.parse` converts every number to an IEEE-754 double, so formatting through
 * `JSON.parse` + `JSON.stringify` silently changes data: 12345678901234567890 becomes
 * 12345678901234567000, 1.10 becomes 1.1, -0 becomes 0, 1e400 becomes null.
 * Instead this module parses the text into a small syntax tree in which every number
 * (and true/false/null) is kept as the ORIGINAL TEXT, then prints that tree.
 * Formatting therefore only changes whitespace; number literals are copied verbatim.
 *
 * WHAT IS (AND IS NOT) PRESERVED
 *  - Numbers, true, false, null: copied verbatim.
 *  - Object key order: kept as written. (`JSON.parse` would move integer-like keys such as "1" to the front.)
 *  - Duplicate keys: NOT preserved, same as before this module was lossless. The LAST value wins and takes the
 *    position of the FIRST occurrence, exactly like `JSON.parse`. This is a known limitation (data in the earlier
 *    duplicate is dropped); whether duplicates should be kept or reported is a product decision.
 *  - Strings and keys: decoded and re-encoded like `JSON.stringify` does, so escape spelling
 *    is normalized ("\u00e9" -> "é", "\/" -> "/") but the string VALUE never changes.
 *
 * VALIDATION
 * Strict RFC 8259 grammar with the same accept/reject behavior as `JSON.parse`, covered by
 * differential tests against `JSON.parse`. One intentional exception: nesting deeper than
 * MAX_JSON_DEPTH is rejected even though `JSON.parse` accepts it (see LIMITS).
 * Errors are SyntaxError with line and column.
 *
 * LIMITS
 *  - Maximum nesting depth: MAX_JSON_DEPTH (1000). The parser is recursive; the limit keeps
 *    it far away from the JavaScript call-stack limit and gives a readable error.
 *  - The whole document is held in memory (fine for typical pasted JSON; multi-hundred-MB
 *    inputs are out of scope for a browser textarea).
 *
 * mode: "minify" | "2" | "4" (indent width). Anything non-numeric or 0 falls back to 2, widths
 * above 10 are capped at 10 and a width below 1 prints compact output, exactly like
 * `JSON.stringify(value, null, width)`.
 */

export const MAX_JSON_DEPTH = 1000;

type JsonNode =
  | { type: "object"; entries: Array<{ key: string; value: JsonNode }> }
  | { type: "array"; items: JsonNode[] }
  | { type: "string"; value: string }
  | { type: "raw"; text: string }; // number | true | false | null, original text

const NUMBER_RE = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const WORD_RE = /[A-Za-z_$][\w$]*/y;

function locate(text: string, index: number): { line: number; column: number } {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) { line++; lineStart = i + 1; }
  }
  return { line, column: index - lineStart + 1 };
}

function describeChar(char: string | undefined): string {
  if (char === undefined) return "end of input";
  const code = char.charCodeAt(0);
  if (code <= 0x20 || code >= 0x7f) return `character U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
  return `character "${char}"`;
}

function parseJson(text: string): JsonNode {
  let pos = 0;

  const fail = (message: string, at: number = pos): never => {
    const { line, column } = locate(text, at);
    throw new SyntaxError(`Invalid JSON at line ${line}, column ${column}: ${message}.`);
  };
  const unexpected = (expected: string): never =>
    fail(pos >= text.length ? `unexpected end of input, expected ${expected}` : `unexpected ${describeChar(text[pos])}, expected ${expected}`);
  const skipWhitespace = () => {
    while (pos < text.length) {
      const code = text.charCodeAt(pos);
      if (code === 32 || code === 9 || code === 10 || code === 13) pos++; else break;
    }
  };

  function parseString(): string {
    const start = pos;
    pos++; // opening quote
    for (;;) {
      if (pos >= text.length) return fail("unterminated string", start);
      const code = text.charCodeAt(pos);
      if (code === 34) { pos++; break; }
      if (code < 0x20) return fail("a raw line break or control character is not allowed inside a string (use \\n or \\t)");
      if (code === 92) {
        const next = text[pos + 1];
        if (next !== undefined && '"\\/bfnrt'.includes(next)) { pos += 2; continue; }
        if (next === "u") {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(pos + 2, pos + 6))) return fail("invalid \\u escape, expected 4 hexadecimal digits");
          pos += 6;
          continue;
        }
        return fail(next === undefined ? "unterminated string" : `invalid escape sequence "\\${next}"`);
      }
      pos++;
    }
    // The literal was validated above, so JSON.parse is safe and gives the exact string value.
    return JSON.parse(text.slice(start, pos)) as string;
  }

  function parseNumber(): JsonNode {
    NUMBER_RE.lastIndex = pos;
    const match = NUMBER_RE.exec(text);
    const next = match ? text[pos + match[0].length] : undefined;
    if (!match || (next !== undefined && /[\w.+-]/.test(next))) {
      const token = /^[^\s,\]}:]*/.exec(text.slice(pos))?.[0] ?? "";
      return fail(`invalid number "${token}"`);
    }
    pos += match[0].length;
    return { type: "raw", text: match[0] };
  }

  function parseWord(): JsonNode {
    WORD_RE.lastIndex = pos;
    const word = WORD_RE.exec(text)?.[0] ?? "";
    if (word === "true" || word === "false" || word === "null") {
      pos += word.length;
      return { type: "raw", text: word };
    }
    return fail(`unexpected value "${word}" (JSON only allows true, false and null as bare words)`);
  }

  function parseValue(depth: number): JsonNode {
    skipWhitespace();
    const char = text[pos];
    if (char === undefined) return unexpected("a value");
    if (char === "{") return parseObject(depth);
    if (char === "[") return parseArray(depth);
    if (char === '"') return { type: "string", value: parseString() };
    if (char === "-" || char === "+" || char === "." || (char >= "0" && char <= "9")) return parseNumber();
    if (/[A-Za-z_$]/.test(char)) return parseWord();
    if (char === "'") return fail("single quotes are not allowed, JSON strings must use double quotes");
    return fail(`unexpected ${describeChar(char)}, expected a value`);
  }

  function parseObject(depth: number): JsonNode {
    if (depth >= MAX_JSON_DEPTH) return fail(`nesting is deeper than ${MAX_JSON_DEPTH} levels`);
    pos++; // {
    const entries: Array<{ key: string; value: JsonNode }> = [];
    const positionOfKey = new Map<string, number>();
    skipWhitespace();
    if (text[pos] === "}") { pos++; return { type: "object", entries }; }
    for (;;) {
      skipWhitespace();
      if (text[pos] !== '"') {
        if (text[pos] === "}" && entries.length > 0) return fail('trailing comma before "}" is not allowed');
        return unexpected("a double-quoted property name");
      }
      const key = parseString();
      skipWhitespace();
      if (text[pos] !== ":") return unexpected('":" after the property name');
      pos++;
      const value = parseValue(depth + 1);
      const existing = positionOfKey.get(key);
      if (existing === undefined) { positionOfKey.set(key, entries.length); entries.push({ key, value }); }
      else entries[existing].value = value; // duplicate key: last value wins, first position kept (like JSON.parse)
      skipWhitespace();
      if (text[pos] === ",") { pos++; continue; }
      if (text[pos] === "}") { pos++; return { type: "object", entries }; }
      return unexpected('"," or "}"');
    }
  }

  function parseArray(depth: number): JsonNode {
    if (depth >= MAX_JSON_DEPTH) return fail(`nesting is deeper than ${MAX_JSON_DEPTH} levels`);
    pos++; // [
    const items: JsonNode[] = [];
    skipWhitespace();
    if (text[pos] === "]") { pos++; return { type: "array", items }; }
    for (;;) {
      skipWhitespace();
      if (text[pos] === "]" && items.length > 0) return fail('trailing comma before "]" is not allowed');
      items.push(parseValue(depth + 1));
      skipWhitespace();
      if (text[pos] === ",") { pos++; continue; }
      if (text[pos] === "]") { pos++; return { type: "array", items }; }
      return unexpected('"," or "]"');
    }
  }

  skipWhitespace();
  if (pos >= text.length) throw new SyntaxError("Invalid JSON: the input is empty.");
  const root = parseValue(0);
  skipWhitespace();
  if (pos < text.length) return fail(`unexpected ${describeChar(text[pos])} after the end of the JSON value`);
  return root;
}

function print(node: JsonNode, gap: string, level: number, parts: string[]): void {
  if (node.type === "raw") { parts.push(node.text); return; }
  if (node.type === "string") { parts.push(JSON.stringify(node.value)); return; }

  const isObject = node.type === "object";
  const count = isObject ? node.entries.length : node.items.length;
  parts.push(isObject ? "{" : "[");
  if (count > 0) {
    const inner = gap ? "\n" + gap.repeat(level + 1) : "";
    for (let i = 0; i < count; i++) {
      if (i > 0) parts.push(",");
      parts.push(inner);
      if (node.type === "object") {
        parts.push(JSON.stringify(node.entries[i].key), gap ? ": " : ":");
        print(node.entries[i].value, gap, level + 1, parts);
      } else {
        print(node.items[i], gap, level + 1, parts);
      }
    }
    if (gap) parts.push("\n" + gap.repeat(level));
  }
  parts.push(isObject ? "}" : "]");
}

/** Throws SyntaxError (message includes line and column) for invalid JSON. */
export function formatJson(input: string, mode: string): string {
  const tree = parseJson(input);
  const width = mode === "minify" ? 0 : Math.min(10, Math.floor(Number(mode) || 2));
  const parts: string[] = [];
  print(tree, width >= 1 ? " ".repeat(width) : "", 0, parts);
  return parts.join("");
}
