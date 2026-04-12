// ─────────────────────────────────────────────────────────────
//  notes.service.js
//  PURPOSE: Bridge between the API layer and the core engine.
//
//  Why a service layer?
//    - Routes should ONLY handle HTTP (request/response).
//    - Business logic (input validation, calling the engine) lives HERE.
//    - Makes unit-testing and future feature changes easy.
// ─────────────────────────────────────────────────────────────

import { processText } from "../../../core/index.js";

/**
 * processNotes
 * @param {string} text - Raw text from the API request body
 * @returns {object} - { notes, keywords, sentences, summary }
 * @throws {Error} - If text is missing or blank
 */
export function processNotes(text) {
  // Guard: reject empty or whitespace-only input early
  if (!text || !text.trim()) {
    throw new Error("No input provided. Please send a non-empty 'text' field.");
  }

  // Delegate all processing to the core engine
  const result = processText(text);

  // If the core engine itself returned an error flag, surface it
  if (result.error) {
    throw new Error(result.error);
  }

  return result;
}
