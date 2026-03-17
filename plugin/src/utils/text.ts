export function fitTextByChars(text: string, maxChars: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars - 1).replace(/\s+$/, "") + "…";
}

export function fitTextByWords(text: string, maxWords: number): string {
  const words = text.trim().replace(/\s+/g, " ").split(" ");
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ");
}