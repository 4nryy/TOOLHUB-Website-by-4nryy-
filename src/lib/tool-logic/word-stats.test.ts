import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getWordStats } from "./word-stats";

const words = (n: number) => Array.from({ length: n }, () => "kata").join(" ");

describe("getWordStats — normal behavior", () => {
  it("counts words and characters", () => {
    assert.deepEqual(getWordStats("Hello world"), { words: 2, characters: 11, noSpaces: 10, sentences: 0, reading: 1 });
  });
  it("counts sentences ended by . ! ?", () => {
    assert.equal(getWordStats("Hello world. How are you? Fine!").sentences, 3);
  });
  it("treats runs of punctuation as one sentence end", () => {
    assert.equal(getWordStats("Wow!!! Really?!").sentences, 2);
    assert.equal(getWordStats("Wait... what").sentences, 1);
  });
  it("does not treat a decimal point as a sentence end", () => {
    assert.equal(getWordStats("Pi is 3.14 roughly").sentences, 0);
  });
  it("splits words on any whitespace (tabs, newlines, multiple spaces)", () => {
    assert.equal(getWordStats("a\n\nb\t c   d").words, 4);
  });
  it("ignores leading/trailing whitespace for word count but not for character count", () => {
    const s = getWordStats("  hi  ");
    assert.equal(s.words, 1);
    assert.equal(s.characters, 6);
    assert.equal(s.noSpaces, 2);
  });
});

describe("getWordStats — empty input", () => {
  it("empty string gives all zeros", () => {
    assert.deepEqual(getWordStats(""), { words: 0, characters: 0, noSpaces: 0, sentences: 0, reading: 0 });
  });
  it("whitespace-only gives zero words/sentences/reading but counts characters", () => {
    assert.deepEqual(getWordStats("   \n "), { words: 0, characters: 5, noSpaces: 0, sentences: 0, reading: 0 });
  });
});

describe("getWordStats — reading time (200 words per minute, minimum 1)", () => {
  it("1 word -> 1 minute", () => assert.equal(getWordStats("kata").reading, 1));
  it("200 words -> 1 minute", () => assert.equal(getWordStats(words(200)).reading, 1));
  it("201 words -> 2 minutes", () => assert.equal(getWordStats(words(201)).reading, 2));
  it("400 words -> 2 minutes", () => assert.equal(getWordStats(words(400)).reading, 2));
  it("401 words -> 3 minutes", () => assert.equal(getWordStats(words(401)).reading, 3));
});

describe("getWordStats — edge cases", () => {
  it("counts characters as UTF-16 code units (an emoji counts as 2)", () => {
    assert.equal(getWordStats("🌏").characters, 2);
  });
  it("handles a very large input", () => {
    assert.equal(getWordStats(words(100000)).words, 100000);
  });
});


describe("getWordStats — abbreviations do not create extra sentences", () => {
  const sentences = (text: string) => getWordStats(text).sentences;
  it("titles: Mr, Mrs, Ms, Dr, Prof, Sr, Jr, St, Mt", () => {
    assert.equal(sentences("Dr. Smith went home. Ok?"), 2);
    assert.equal(sentences("Ask Dr. Smith. He knows."), 2);
    assert.equal(sentences("Mr. and Mrs. Lee met Prof. Tan at St. Mary's. They left."), 2);
    assert.equal(sentences("John Smith Jr. arrived. Ms. Ng left."), 2);
  });
  it("Indonesian titles and address words: Ir, Hj, Bpk, Jl", () => {
    assert.equal(sentences("Bpk. Budi dan Hj. Siti pergi. Mereka pulang."), 2);
    assert.equal(sentences("Ir. Soekarno lahir di Surabaya. Ia wafat di Jakarta."), 2);
    assert.equal(sentences("Alamatnya Jl. Merdeka sangat jauh. Kami berangkat."), 2);
  });
  it("labels followed by a number: No. 5, hlm. 10, Fig. 3, vol. 2", () => {
    assert.equal(sentences("Jl. Merdeka No. 5 sangat ramai. Kami pergi."), 2);
    assert.equal(sentences("See Fig. 3 and hlm. 10 for details. Done."), 2);
    assert.equal(sentences("Published in vol. 2 of the series. Good."), 2);
  });
  it("'No.' as an ordinary word still ends a sentence", () => {
    assert.equal(sentences("Ready? No. Not yet."), 3);
  });
  it("initials", () => {
    assert.equal(sentences("J. K. Rowling wrote it."), 1);
    assert.equal(sentences("Pak H. Ahmad pergi. Dia pulang."), 2);
    assert.equal(sentences("Plan B."), 1); // a final period always counts
  });
  it("e.g. and i.e. are not sentence ends", () => {
    assert.equal(sentences("See e.g. the docs. Done."), 2);
    assert.equal(sentences("Use a tool, i.e. a hammer. Then rest."), 2);
  });
  it("etc., dll., Inc. end a sentence only before a capitalized word", () => {
    assert.equal(sentences("Buy milk, eggs, etc. Then go home."), 2);
    assert.equal(sentences("Buy milk, eggs, etc. and bread."), 1);
    assert.equal(sentences("Beli apel, jeruk, dll. Lalu pulang."), 2);
    assert.equal(sentences("Beli apel, jeruk, dll. dan pisang."), 1);
    assert.equal(sentences("Acme Inc. makes rockets. Ltd. companies too."), 2);
  });
  it("dotted letter abbreviations (U.S.A., a.m.) end a sentence only before a capitalized word", () => {
    assert.equal(sentences("He works in the U.S.A. and lives here."), 1);
    assert.equal(sentences("It starts at 9 a.m. sharp. Then lunch."), 2);
  });
  it("an abbreviation at the very end of the text counts as the end", () => {
    assert.equal(sentences("Etc."), 1);
    assert.equal(sentences("Dr."), 1);
    assert.equal(sentences("We sell A, B, etc."), 1);
  });
  it("is not confused by quotes and brackets around abbreviations", () => {
    assert.equal(sentences('She said "Dr. Smith left." Then he came.'), 2);
    assert.equal(sentences("(Ask Dr. Smith.) Next."), 2);
  });
});

describe("getWordStats — sentence ends with punctuation variants", () => {
  const sentences = (text: string) => getWordStats(text).sentences;
  it("counts a sentence that ends inside closing quotes or brackets", () => {
    assert.equal(sentences('He said "Hello." Then he left.'), 2);
    assert.equal(sentences("(See above.) Next."), 2);
    assert.equal(sentences("“Quote.” Next."), 2);
    assert.equal(sentences("Really?” she asked."), 1); // dialogue tag, not a second sentence
  });
  it("splits after a closing quote only when the next word is not lowercase", () => {
    assert.equal(sentences('"Stop!" he cried. Then silence.'), 2);
    assert.equal(sentences('"Stop!" Then silence.'), 2);
    assert.equal(sentences('He said "no." then left.'), 1);
    assert.equal(sentences('"Why?" "Because." Fine.'), 3);
  });
  it("ignores periods inside numbers, versions and domain names", () => {
    assert.equal(sentences("Version 2.0 is out. Enjoy."), 2);
    assert.equal(sentences("Visit example.com. Then relax."), 2);
    assert.equal(sentences("Pi is 3.14 roughly."), 1);
    assert.equal(sentences("Email me at a.b@c.org today."), 1); // only the final period ends the sentence
  });
  it("ellipses and ! / ? runs always end a sentence", () => {
    assert.equal(sentences("Hmm... Okay. Yes."), 3);
    assert.equal(sentences("What?! No way!!! Fine."), 3);
  });
  it("does not stop at a period that is followed by a non-space character", () => {
    assert.equal(sentences("a.b.c"), 0);
    assert.equal(sentences("end.Next"), 0);
  });
});

describe("getWordStats — word counting ignores stand-alone punctuation", () => {
  const words = (text: string) => getWordStats(text).words;
  it("does not count dashes, ampersands, bullets or ellipses as words", () => {
    assert.equal(words("Hello — world"), 2);
    assert.equal(words("a - b & c"), 3);
    assert.equal(words("• item one"), 2);
    assert.equal(words("..."), 0);
    assert.equal(words("-- ** ## !!"), 0);
  });
  it("counts hyphenated words, abbreviations, numbers and emoji", () => {
    assert.equal(words("state-of-the-art e.g."), 2);
    assert.equal(words("3.14 -- 2"), 2);
    assert.equal(words("😀 ok"), 2);
    assert.equal(words("2026"), 1);
  });
  it("counts words in non-Latin scripts and splits on Unicode spaces", () => {
    assert.equal(words("привет мир"), 2);
    assert.equal(words("日本語 テキスト"), 2);
    assert.equal(words("a\u00a0b\u3000c"), 3); // no-break space and ideographic space
  });
  it("counts a word that is wrapped in punctuation", () => {
    assert.equal(words('"quoted" (paren) [bracket] end.'), 4);
  });
  it("counts the same words with extra or unusual whitespace around them", () => {
    assert.equal(words("  a \n\n b\t\tc \r\n d "), 4);
  });
});

describe("getWordStats — large input", () => {
  it("handles hundreds of thousands of words and sentences", () => {
    const paragraph = 'Dr. Smith went home. He said "ok." Then etc. Next one! ';
    const stats = getWordStats(paragraph.repeat(20000));
    assert.equal(stats.words, 20000 * 11);
    assert.equal(stats.sentences, 20000 * 4); // per paragraph: "home." | "ok." | "etc. Then" | "one!"
  });
});

describe("getWordStats — 'ms' is a unit or a title depending on case", () => {
  it("counts 'I ran 10 ms. Then I rested.' as 2 sentences", () => {
    assert.equal(getWordStats("I ran 10 ms. Then I rested.").sentences, 2);
  });
});

describe("getWordStats — KNOWN LIMITATIONS (documented, current behavior)", () => {
  it("a sentence that ends with a single capital letter is mistaken for an initial", () => {
    assert.equal(getWordStats("Take vitamin C. Then rest.").sentences, 1);
  });
  it("abbreviations that are not in the lists are treated as sentence ends", () => {
    assert.equal(getWordStats("Visit the Bldg. Then leave.").sentences, 2);
  });
});

describe("getWordStats — KNOWN ISSUES (still open, current behavior; out of scope for Task 2A)", () => {
  it("text without closing punctuation has 0 sentences", () => {
    assert.equal(getWordStats("tanpa titik di akhir").sentences, 0);
  });
});
