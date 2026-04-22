// ================================================================
//  core/index.js — Main Entry Point
//
//  PURPOSE:
//    This is the "orchestrator" of the core engine.
//    It imports every module and runs them in the correct order.
//
//  THE PIPELINE (in order):
//    1. cleanText()      → Normalise input (fix smart quotes, collapse spaces)
//    2. splitSentences() → Break text into individual sentences
//    3. getKeywords()    → Count meaningful word frequencies
//    4. summarize()      → Score and pick top sentences
//    5. buildNotes()     → Format top sentences as clean study notes
//
//  WHY THIS ORDER MATTERS:
//    Each step depends on the previous one:
//    - You must CLEAN before you SPLIT (or punctuation confuses the splitter)
//    - You must SPLIT before you SCORE (you need sentences to compare)
//    - You must SCORE before you BUILD NOTES (notes come from top sentences)
//
//  WHAT IS EXPORTED:
//    processText(text) → returns:
//    {
//      notes:     string[]  — formatted study notes
//      keywords:  object    — top keywords and their frequency scores
//      sentences: string[]  — all sentences extracted from the input
//      summary:   string[]  — the highest-scoring sentences (raw)
//    }
// ================================================================

import { cleanText }      from "./text/cleaner.js";
import { splitSentences } from "./text/tokenizer.js";
import { getKeywords }    from "./analysis/keywordEngine.js";
import { summarize }      from "./analysis/summaryEngine.js";
import { buildNotes }     from "./generation/notesBuilder.js";

/**
 * processText
 * Runs the full MindScribe core pipeline on a piece of text.
 *
 * @param  {string} text - Raw user input
 * @returns {{ notes: string[], keywords: object, sentences: string[], summary: string[] }}
 */
export function processText(text) {
  // Guard: return an empty result if input is missing or blank
  if (!text || !text.trim()) {
    return {
      notes:     [],
      keywords:  {},
      sentences: [],
      summary:   [],
      error:     "No valid input provided"
    };
  }

  // ── Step 1: Clean ─────────────────────────────────────────────
  const clean = cleanText(text);

  // ── Step 2: Split into sentences ──────────────────────────────
  const sentences = splitSentences(clean);

  // ── Step 3: Get keyword frequencies ──────────────────────────
  // We use the FULL keyword map (not yet trimmed) for scoring,
  // so every word's real frequency influences sentence ranking.
  const allKeywords = getKeywords(clean);

  // Top 15 keywords for display (sorted by frequency, highest first)
  const topKeywords = Object.fromEntries(
    Object.entries(allKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
  );

  // ── Step 4: Score & summarise ─────────────────────────────────
  const summary = summarize(sentences, allKeywords);

  // ── Step 5: Build formatted notes ────────────────────────────
  const notes = buildNotes(summary);

  return { notes, keywords: topKeywords, sentences, summary };
}
