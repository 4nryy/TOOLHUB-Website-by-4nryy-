import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { KNOWN_ACRONYMS, formatText } from "./text-format";

const MODES = ["uppercase", "lowercase", "title", "sentence", "trim", "spaces"] as const;

describe("formatText — normal behavior", () => {
  it("uppercase", () => assert.equal(formatText("Hello World", "uppercase"), "HELLO WORLD"));
  it("lowercase", () => assert.equal(formatText("Hello WORLD", "lowercase"), "hello world"));
  it("title case", () => assert.equal(formatText("hello wORLD from toolhub", "title"), "Hello World From Toolhub"));
  it("title case keeps leading whitespace", () => assert.equal(formatText("  hello", "title"), "  Hello"));
  it("sentence case capitalizes after . ! ?", () => {
    assert.equal(formatText("hello world. how ARE you? fine!", "sentence"), "Hello world. How are you? Fine!");
  });
  it("trim removes spaces at the start/end of every line", () => {
    assert.equal(formatText("  a  \n   b  ", "trim"), "a\nb");
  });
  it("spaces collapses all whitespace (including newlines) into single spaces", () => {
    assert.equal(formatText("  a   b \n c ", "spaces"), "a b c");
  });
  it("an unknown mode falls back to 'spaces'", () => {
    assert.equal(formatText("  a   b ", "nonsense"), "a b");
  });
  it("preserves newlines in case-changing modes", () => {
    assert.equal(formatText("a\nb", "uppercase"), "A\nB");
  });
});

describe("formatText — empty and whitespace-only input", () => {
  for (const mode of MODES) {
    it(`empty string stays empty (${mode})`, () => assert.equal(formatText("", mode), ""));
  }
  it("whitespace-only input becomes empty in 'spaces' mode", () => assert.equal(formatText("   \n  ", "spaces"), ""));
  it("whitespace-only input is left alone by title/sentence", () => {
    assert.equal(formatText("   ", "title"), "   ");
    assert.equal(formatText("   ", "sentence"), "   ");
  });
});

describe("formatText — edge cases", () => {
  it("handles emoji and digits without throwing", () => {
    assert.equal(formatText("😀 abc 123", "uppercase"), "😀 ABC 123");
    assert.equal(formatText("😀 abc 123", "title"), "😀 Abc 123");
  });
  it("handles Windows line endings in 'trim' mode", () => {
    assert.equal(formatText("  a \r\n b ", "trim"), "a\nb");
  });
  it("handles a very long input", () => {
    const long = "word ".repeat(20000);
    assert.equal(formatText(long, "spaces"), "word ".repeat(19999) + "word");
  });
});


describe("formatText — 'trim' only trims the ends of each line", () => {
  it("keeps spaces and tabs INSIDE a line untouched", () => {
    assert.equal(formatText("a    b", "trim"), "a    b");
    assert.equal(formatText("  a\t\tb   c  ", "trim"), "a\t\tb   c");
    assert.equal(formatText("  col1    col2  \n  x      y ", "trim"), "col1    col2\nx      y");
  });
  it("keeps blank lines and a trailing newline, and empties whitespace-only lines", () => {
    assert.equal(formatText("a \n\n b", "trim"), "a\n\nb");
    assert.equal(formatText("   \n x", "trim"), "\nx");
    assert.equal(formatText("a \n", "trim"), "a\n");
  });
  it("converts Windows line endings to \\n and handles lone lines", () => {
    assert.equal(formatText("  a \r\n b \r\n", "trim"), "a\nb\n");
    assert.equal(formatText("  single  ", "trim"), "single");
  });
  it("is different from 'spaces', which collapses everything", () => {
    assert.equal(formatText("a    b\n\n c", "trim"), "a    b\n\nc");
    assert.equal(formatText("a    b\n\n c", "spaces"), "a b c");
  });
});

describe("formatText — Unicode letters", () => {
  it("sentence case capitalizes accented, Greek and Cyrillic first letters", () => {
    assert.equal(formatText("étude. égal", "sentence"), "Étude. Égal");
    assert.equal(formatText("ñandú come. über alles", "sentence"), "Ñandú come. Über alles");
    assert.equal(formatText("ωραία μέρα. καλημέρα", "sentence"), "Ωραία μέρα. Καλημέρα");
    assert.equal(formatText("привет мир. как дела? хорошо!", "sentence"), "Привет мир. Как дела? Хорошо!");
  });
  it("title case capitalizes non-ASCII first letters", () => {
    assert.equal(formatText("élan vital ñandú", "title"), "Élan Vital Ñandú");
    assert.equal(formatText("ÉCOLE NORMALE", "title"), "École Normale");
  });
  it("handles letters outside the Basic Multilingual Plane (surrogate pairs)", () => {
    assert.equal(formatText("\u{10428} \u{10428}", "title"), "\u{10400} \u{10400}");
    assert.equal(formatText("\u{10428}x. \u{10428}y", "sentence"), "\u{10400}x. \u{10400}y");
  });
  it("leaves scripts without letter case alone", () => {
    assert.equal(formatText("日本語 の テキスト。 次の文", "sentence"), "日本語 の テキスト。 次の文");
    assert.equal(formatText("日本語 テキスト", "title"), "日本語 テキスト");
  });
  it("sentence case capitalizes after a period followed by a newline or several spaces", () => {
    assert.equal(formatText("a.\nb.   c", "sentence"), "A.\nB.   C");
  });
  it("sentence case does not change a sentence that starts with a digit", () => {
    assert.equal(formatText("123 start. 4 more", "sentence"), "123 start. 4 more");
  });
});

describe("formatText — common acronyms survive title and sentence case", () => {
  it("keeps HTML, API, URL and JSON in mixed-case text", () => {
    assert.equal(formatText("learn HTML and the API for JSON via a URL", "title"), "Learn HTML And The API For JSON Via A URL");
    assert.equal(formatText("the HTML spec. uses API calls and a URL", "sentence"), "The HTML spec. Uses API calls and a URL");
  });
  it("keeps them in text that is entirely upper case", () => {
    assert.equal(formatText("HTML API URL JSON", "title"), "HTML API URL JSON");
    assert.equal(formatText("HTML API URL JSON", "sentence"), "HTML API URL JSON");
    assert.equal(formatText("LEARN HTML AND API DESIGN", "title"), "Learn HTML And API Design");
  });
  it("keeps other listed acronyms (technology, organizations, Indonesian)", () => {
    assert.equal(formatText("NASA launched. FBI too.", "title"), "NASA Launched. FBI Too.");
    assert.equal(formatText("NASA launched. FBI too.", "sentence"), "NASA launched. FBI too.");
    assert.equal(formatText("kirim ke PT MAJU dan CV BARU", "title"), "Kirim Ke PT Maju Dan CV Baru");
    assert.equal(formatText("urus KTP dan NPWP di BPJS", "sentence"), "Urus KTP dan NPWP di BPJS");
    assert.equal(formatText("USB, CSS and SQL", "title"), "USB, CSS And SQL");
  });
  it("keeps an acronym that ends with digits (HTML5, UUID4)", () => {
    assert.equal(formatText("HTML5 and UUID4 are great", "sentence"), "HTML5 and UUID4 are great");
    assert.equal(formatText("USING HTML5 TODAY", "title"), "Using HTML5 Today");
  });
  it("keeps acronyms next to punctuation", () => {
    assert.equal(formatText("(API), HTML/CSS and JSON's URL.", "title"), "(API), HTML/CSS And JSON's URL.");
    assert.equal(formatText("use the api (JSON). then stop", "sentence"), "Use the api (JSON). Then stop");
  });
  it("does not promote lowercase or mixed-case spellings to acronyms", () => {
    assert.equal(formatText("html api url json", "title"), "Html Api Url Json");
    assert.equal(formatText("Html Api", "title"), "Html Api");
    assert.equal(formatText("Json", "sentence"), "Json");
  });
  it("still normalizes ordinary words typed in capitals", () => {
    assert.equal(formatText("THIS IS SHOUTING TEXT", "title"), "This Is Shouting Text");
    assert.equal(formatText("IT IS A TEST. OK? WHO KNOWS", "sentence"), "It is a test. Ok? Who knows");
  });
  it("does not affect uppercase, lowercase, trim and spaces modes", () => {
    assert.equal(formatText("HTML api", "uppercase"), "HTML API");
    assert.equal(formatText("HTML API", "lowercase"), "html api");
    assert.equal(formatText("  HTML   API ", "spaces"), "HTML API");
    assert.equal(formatText("  HTML   API ", "trim"), "HTML   API");
  });
  it("only lists upper-case entries, and none that are ordinary English words", () => {
    for (const word of KNOWN_ACRONYMS) assert.equal(word, word.toUpperCase());
    for (const risky of ["IT", "US", "ID", "OK", "IS", "AS", "OR", "IN", "ON", "AT", "BE", "WHO", "WIT", "ME", "NO", "SO", "TO", "UP", "WE", "HE", "AM", "AN", "ARE", "CAN"]) {
      assert.ok(!KNOWN_ACRONYMS.has(risky), `${risky} must not be protected`);
    }
  });
});

describe("formatText — consistency across modes", () => {
  const MODES_ALL = ["uppercase", "lowercase", "title", "sentence", "trim", "spaces"];
  const CORPUS = [
    "", " ", "\n", "   \n  ", "hello world", "  Hello   WORLD. how ARE you?  \n second LINE. HTML5 & API ", "étude. ÉGAL ñandú",
    "a\r\nb\r\n", "NASA launched. FBI too.", "😀 emoji 😀", "日本語 テキスト", "x".repeat(2000),
  ];
  it("every mode returns a string for every input, and never throws", () => {
    for (const mode of MODES_ALL) for (const text of CORPUS) assert.equal(typeof formatText(text, mode), "string", `${mode}: ${JSON.stringify(text)}`);
  });
  it("every mode is idempotent (formatting the result again changes nothing)", () => {
    for (const mode of MODES_ALL) {
      for (const text of CORPUS) {
        const once = formatText(text, mode);
        assert.equal(formatText(once, mode), once, `${mode}: ${JSON.stringify(text)}`);
      }
    }
  });
  it("lowercase, title and sentence keep the text length (they only change letter case)", () => {
    for (const mode of ["lowercase", "title", "sentence"]) {
      for (const text of ["hello world. ÉGAL ñandú", "HTML API", "a.\nb"]) assert.equal(formatText(text, mode).length, text.length, `${mode}: ${text}`);
    }
  });
});

describe("formatText — KNOWN LIMITATIONS (documented, current behavior)", () => {
  it("acronyms that are not in KNOWN_ACRONYMS are lower-cased like any other word", () => {
    assert.equal(formatText("ACME launched. ACME too.", "sentence"), "Acme launched. Acme too.");
    assert.equal(formatText("ACME ROCKETS", "title"), "Acme Rockets");
  });
  it("dotted abbreviations are not recognized ('U.S.A. is' becomes 'U.s.a. Is')", () => {
    assert.equal(formatText("U.S.A. is big", "sentence"), "U.s.a. Is big");
  });
  it("case conversion follows default Unicode rules ('ß' upper-cases to 'SS')", () => {
    assert.equal(formatText("straße", "uppercase"), "STRASSE");
    assert.equal(formatText("ßtraße", "title"), "SStraße");
  });
  it("title case does not capitalize a word that starts with punctuation", () => {
    assert.equal(formatText('(hello) "world"', "title"), '(hello) "world"');
  });
});
