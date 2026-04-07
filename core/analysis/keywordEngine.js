import { stopwords } from "./stopwords.js";

export function getKeywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 0 && !stopwords.has(word));

  const freq = {};

  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  return freq;
}
