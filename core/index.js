import { cleanText } from "./text/cleaner.js";
import { splitSentences } from "./text/tokenizer.js";
import { getKeywords } from "./analysis/keywordEngine.js";
import { summarize } from "./analysis/summaryEngine.js";
import { buildNotes } from "./generation/notesBuilder.js";

export function processText(text) {
  if (!text || !text.trim()) {
    return {
      notes: [],
      keywords: {},
      sentences: [],
      summary: [],
      error: "No valid input provided"
    };
  }

  const clean = cleanText(text);
  const sentences = splitSentences(clean);
  const keywords = getKeywords(clean);

  const sortedKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topKeywords = Object.fromEntries(sortedKeywords);

  const summary = summarize(sentences, keywords);
  const notes = buildNotes(summary);

  return { notes, keywords: topKeywords, sentences, summary };
}


