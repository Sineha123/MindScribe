// ================================================================
//  keywordEngine.js — Keyword Frequency Counter
//
//  PURPOSE:
//    Find the most important words in the text by counting how
//    often each meaningful word appears.
//
//  HOW IT WORKS (step by step):
//    1. Lowercase the entire text          → "JavaScript" = "javascript"
//    2. Remove punctuation symbols         → "object-oriented" → "object oriented"
//    3. Split into individual words        → ["javascript", "is", "powerful", ...]
//    4. Filter out stopwords               → removes "is", "a", "the", etc.
//    5. Filter out very short words        → removes "js", "ui" (≤ 2 chars) — often noise
//    6. Count frequency of each word       → { javascript: 3, powerful: 2 }
//
//  WHY FREQUENCY = IMPORTANCE:
//    If a word appears many times in a text, the author is
//    clearly talking about that topic. Rare words are either
//    unique context words or noise.
// ================================================================

import { stopwords } from "./stopwords.js";

/**
 * getKeywords
 * Returns a frequency map of meaningful words in the text.
 *
 * @param  {string}              text - Cleaned input text
 * @returns {Object.<string,number>}  - e.g. { javascript: 3, programming: 2 }
 */
export function getKeywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // Keep letters, numbers, spaces, hyphens
    .replace(/-/g, " ")            // Split hyphenated words into separate tokens
    .split(/\s+/)
    .filter(word =>
      word.length > 2 &&           // Skip very short words (noise)
      !stopwords.has(word)         // Skip stopwords
    );

  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  return freq;
}
