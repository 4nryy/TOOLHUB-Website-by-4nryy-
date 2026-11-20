/** Word Counter logic. Pure function. */
export type WordStats = {
  words: number;
  characters: number;
  noSpaces: number;
  sentences: number;
  /** Estimated reading time in minutes (200 wpm, minimum 1 when there is text). */
  reading: number;
};

export function getWordStats(input: string): WordStats {
  const trimmed = input.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const sentences = trimmed ? (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length : 0;
  return {
    words,
    characters: input.length,
    noSpaces: input.replace(/\s/g, "").length,
    sentences,
    reading: words ? Math.max(1, Math.ceil(words / 200)) : 0,
  };
}
