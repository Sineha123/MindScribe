export function extractNodes(keywords) {
  return Object.entries(keywords || {})
    .sort(([, leftWeight], [, rightWeight]) => rightWeight - leftWeight)
    .slice(0, 20)
    .map(([word, frequency]) => ({
      id: word,
      weight: frequency
    }));
}

export function extractLinks(sentences, keywords) {
  const keywordSet = new Set(Object.keys(keywords || {}));
  const links = [];

  (sentences || []).forEach((sentence) => {
    const wordsInSentence = (sentence.toLowerCase().match(/[a-z0-9]+/g) || [])
      .filter((word) => keywordSet.has(word));

    for (let index = 0; index < wordsInSentence.length - 1; index += 1) {
      links.push({
        source: wordsInSentence[index],
        target: wordsInSentence[index + 1]
      });
    }
  });

  return links;
}

export function removeDuplicateLinks(links) {
  const uniqueLinks = new Map();

  (links || []).forEach((link) => {
    const source = String(link.source);
    const target = String(link.target);
    const key = [source, target].sort().join("::");

    if (!uniqueLinks.has(key) && source !== target) {
      uniqueLinks.set(key, { source, target });
    }
  });

  return Array.from(uniqueLinks.values());
}
