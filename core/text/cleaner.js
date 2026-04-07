export function cleanText(text) {
  // Collapse repeated whitespace and trim edges.
  return text.replace(/\s+/g, " ").trim();
}
