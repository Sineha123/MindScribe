// ================================================================
//  tokenizer.js — Sentence Splitter
//
//  PURPOSE:
//    Break a paragraph of text into individual sentences.
//
//  THE KEY FIX vs the old version:
//    Old: Also stripped ALL punctuation inside sentences, which
//         caused "object-oriented" → "objectoriented" (looks broken).
//
//    New: We ONLY split on sentence-ending punctuation (. ! ?)
//         and keep the sentence text exactly as-is (readable).
//         We just trim whitespace from each sentence.
//
//  MINIMUM LENGTH GUARD:
//    We filter out anything shorter than 4 characters — these are
//    usually just sentence fragments or stray punctuation artefacts.
// ================================================================

/**
 * splitSentences
 * Splits clean text into an array of individual sentences.
 *
 * @param  {string}   text - Cleaned text from cleanText()
 * @returns {string[]}      - Array of sentences, each properly trimmed
 *
 * Example:
 *   "AI is powerful. It helps humans!" → ["AI is powerful", "It helps humans"]
 */
export function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)      // Split AFTER punctuation + whitespace (keeps context)
    .map(s => s.replace(/[.!?]+$/, "").trim())   // Remove trailing punctuation, trim
    .filter(s => s.length >= 4); // Discard fragments shorter than 4 characters
}
