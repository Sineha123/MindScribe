// ================================================================
//  summaryEngine.js — Sentence Scorer & Selector
//
//  PURPOSE:
//    Score every sentence based on how many high-frequency
//    keywords it contains, then return the top sentences
//    as a summary of the text.
//
//  HOW SCORING WORKS:
//    Each keyword has a frequency (how many times it appears
//    in the whole text). For each sentence, we add up the
//    frequency of every keyword found inside it.
//
//    Sentence score = sum of (keyword frequency) for each
//                     keyword word inside that sentence.
//
//    A sentence with many high-frequency keywords is likely
//    a central, important idea in the text.
//
//  NORMALISATION:
//    Longer sentences naturally have more words and can
//    accumulate higher raw scores just by being long.
//    We divide by sentence word count to make scoring fair —
//    a short, dense sentence won't lose to a long, repetitive one.
//
//  HOW MANY SENTENCES:
//    We pick top N = max(2, floor(total / 3)) sentences.
//    That means: at least 2, and roughly ⅓ of all sentences.
//    This scales nicely — a 3-sentence text gets 2 summary
//    sentences, a 9-sentence text gets 3, a 12-sentence text gets 4.
// ================================================================

/**
 * summarize
 * Scores and ranks sentences, returns the top ones as a summary.
 *
 * @param  {string[]}              sentences  - From splitSentences()
 * @param  {Object.<string,number>} keywordFreq - From getKeywords()
 * @returns {string[]}                          - Top scored sentences (in original order)
 */
export function summarize(sentences, keywordFreq) {
  if (sentences.length === 0) return [];

  // Score each sentence
  const scored = sentences.map((sentence, index) => {
    const words = sentence
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 0);

    // Raw score = sum of keyword frequencies for words in this sentence
    const rawScore = words.reduce((sum, word) => sum + (keywordFreq[word] || 0), 0);

    // Normalised score = raw / word count (prevents long sentences dominating)
    const score = words.length > 0 ? rawScore / words.length : 0;

    return { sentence, score, index };
  });

  // How many sentences to include in summary (scales with input size)
  const topN = Math.max(2, Math.floor(sentences.length / 3));

  // Pick topN highest-scoring sentences, then re-sort to ORIGINAL ORDER
  // so the summary reads naturally (not randomly reordered)
  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .sort((a, b) => a.index - b.index)  // Restore original reading order
    .map(item => item.sentence);

  return topSentences;
}
