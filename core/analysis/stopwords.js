// ================================================================
//  stopwords.js — Common Words to Ignore
//
//  PURPOSE:
//    Stopwords are words that appear in almost every sentence
//    but carry no meaningful information by themselves.
//
//    Examples: "the", "is", "a", "it", "this", "was"
//
//  WHY WE USE A Set:
//    Set.has() is O(1) — instant lookup.
//    An array would be O(n) — slower for every word check.
//
//  WHY THIS LIST IS LARGE:
//    A very small stopword list (old version had only 10 words)
//    lets junk words like "use", "also", "very", "with" pollute
//    the keyword scores. That made weak sentences rank higher
//    than important ones.
//
//    This expanded list of ~80 common English stopwords gives
//    the keyword engine a much more accurate signal.
// ================================================================

export const stopwords = new Set([
  // Articles
  "a", "an", "the",

  // Pronouns
  "i", "me", "my", "we", "our", "you", "your", "he", "she",
  "it", "its", "they", "them", "their", "this", "that",
  "these", "those", "who", "what", "which",

  // Common verbs (forms of be, have, do)
  "is", "are", "was", "were", "be", "been", "being",
  "has", "have", "had", "do", "does", "did",
  "will", "would", "shall", "should", "may", "might",
  "can", "could", "must", "need",

  // Prepositions & conjunctions
  "in", "on", "at", "by", "for", "with", "about", "against",
  "between", "into", "through", "during", "before", "after",
  "above", "below", "to", "from", "up", "down", "out", "off",
  "over", "under", "again", "then", "once",
  "and", "but", "or", "nor", "so", "yet",
  "of", "as", "if", "than",

  // Common adverbs
  "not", "no", "also", "very", "just", "too", "only",
  "more", "most", "other", "some", "such", "even",
  "both", "each", "few", "how", "all", "any",

  // Common transition words that add no meaning
  "well", "now", "here", "there", "when", "while",
  "where", "why", "however", "thus", "hence", "therefore",
  "still", "already", "always", "often", "usually", "make",
  "use", "used", "using", "get", "got", "let", "put",
  "set", "own", "same", "new"
]);
