export function buildNotes(sentences) {
  return sentences.map((s, i) => `👉 ${i + 1}. ${s}`);
}
