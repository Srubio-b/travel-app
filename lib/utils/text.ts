/**
 * Truncates `text` to at most `maxWords` words, respecting UTF-8 code points
 * and without breaking in the middle of a word.
 */
export function truncateWords(text: string | null | undefined, maxWords: number): string {
  if (!text) return "";

  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();

  return words.slice(0, maxWords).join(" ") + "…";
}
