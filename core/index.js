import { cleanText } from "./text/cleaner.js";
import { splitSentences } from "./text/tokenizer.js";
import { getKeywords } from "./analysis/keywordEngine.js";
import { summarize } from "./analysis/summaryEngine.js";
import { buildNotes } from "./generation/notesBuilder.js";

export function processText(text) {
  const clean = cleanText(text);
  const sentences = splitSentences(clean);
  const keywords = getKeywords(clean);
  const summary = summarize(sentences, keywords);
  const notes = buildNotes(summary);

  return { notes, keywords, sentences, summary };
}

// Simple inline test example
const sampleText = "JavaScript is powerful. It is used everywhere! The language is versatile and important.";
const sampleResult = processText(sampleText);
console.log(sampleResult);
