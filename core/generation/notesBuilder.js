// ================================================================
//  notesBuilder.js — Note Formatter
//
//  PURPOSE:
//    Take the top-scored sentences (from summaryEngine) and
//    turn them into clear, readable study notes.
//
//  WHAT A GOOD NOTE LOOKS LIKE:
//    ❌ Bad:  "👉 1. javascript powerful"
//    ✅ Good: "JavaScript is a powerful programming language."
//
//  HOW WE FORMAT:
//    Each note gets three treatments:
//      1. Capitalise the first letter (sentences should start with a capital)
//      2. Ensure it ends with a full stop (so it reads as a complete thought)
//      3. A numbered prefix so students can reference "Note 3" easily
//
//  WHY NOTES ≠ SUMMARY:
//    Summary  = the raw top-scored sentences (used for the Summary tab).
//    Notes    = formatted, clean, readable bullet points of those sentences.
//
//    Notes are what a student would write in their notebook.
//    Summary is what a search engine would extract.
//
//  MINIMUM LENGTH GUARD:
//    We skip anything under 10 characters — one-word fragments
//    are not useful notes.
// ================================================================

/**
 * buildNotes
 * Formats scored sentences into clean, numbered study notes.
 *
 * @param  {string[]} sentences - Top-scored sentences from summaryEngine()
 * @returns {string[]}           - Array of formatted note strings
 *
 * Example output:
 *  [
 *    "1. JavaScript is a powerful programming language.",
 *    "2. It supports object-oriented and functional programming styles.",
 *    "3. Developers use JavaScript to build interactive web applications."
 *  ]
 */
export function buildNotes(sentences) {
  return sentences
    .filter(s => s && s.trim().length >= 10)   // Must be a real sentence
    .map((sentence, i) => {
      // Step 1: Trim any leftover whitespace
      let note = sentence.trim();

      // Step 2: Capitalise the very first character
      note = note.charAt(0).toUpperCase() + note.slice(1);

      // Step 3: Add a period at the end if it doesn't already have one
      if (!/[.!?]$/.test(note)) {
        note = note + ".";
      }

      // Step 4: Return as a numbered bullet string
      return `${i + 1}. ${note}`;
    });
}
