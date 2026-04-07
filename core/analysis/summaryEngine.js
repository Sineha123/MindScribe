export function summarize(sentences, keywordFreq) {
  if (sentences.length === 0) return [];

  const scored = sentences.map(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    const score = words.reduce((sum, word) => sum + (keywordFreq[word] || 0), 0);
    return { sentence, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(item => item.sentence);
}
