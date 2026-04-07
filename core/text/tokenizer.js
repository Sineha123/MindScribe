export function splitSentences(text) {
  return text
    .split(/[.!?]/)
    .map(sentence => sentence.replace(/[^a-zA-Z0-9\s]/g, "").trim())
    .filter(sentence => sentence.length > 0);
}
