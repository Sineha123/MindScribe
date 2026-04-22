// ================================================================
//  cleaner.js — Text Pre-Processor
//
//  PURPOSE:
//    Clean raw user input before any processing begins.
//    We want consistent, readable text — no messy spacing,
//    no weird Unicode dashes, no curly quotes, etc.
//
//  WHY THIS MATTERS:
//    If we don't clean first, the tokenizer sees "word—next"
//    as one token, and keywords engines behave unpredictably.
// ================================================================

/**
 * cleanText
 * Normalises raw input text so the rest of the engine works properly.
 *
 * Steps:
 *  1. Replace curly/smart quotes with straight ones
 *  2. Replace em/en dashes with a space (so "word—word" becomes two tokens)
 *  3. Collapse all whitespace runs (tabs, newlines, double spaces) into a single space
 *  4. Trim leading and trailing whitespace
 *
 * @param  {string} text - Raw input from the user
 * @returns {string}      - Clean, normalised text
 */
export function cleanText(text) {
  return text
    .replace(/[\u2018\u2019]/g, "'")    // Smart single quotes → '
    .replace(/[\u201C\u201D]/g, '"')    // Smart double quotes → "
    .replace(/[\u2013\u2014]/g, " ")    // En/Em dashes → space
    .replace(/\s+/g, " ")              // Collapse all whitespace
    .trim();
}
