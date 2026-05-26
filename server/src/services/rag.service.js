/**
 * Splits text into semantic chunks based on sentence boundaries.
 * @param {string} text - The input text.
 * @param {number} chunkSize - Approximate character length per chunk.
 * @returns {string[]}
 */
export function chunkText(text, chunkSize = 1500) {
  if (!text) return [];
  
  // Split into sentences using a punctuation regex
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

/**
 * Tokenizes a string for search matching (lowercases, strips punctuation/stopwords).
 * @param {string} str 
 * @returns {string[]}
 */
function tokenize(str) {
  const stopwords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
    'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 
    'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 
    'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 
    'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 
    'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 
    'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 
    's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
  ]);
  
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));
}

/**
 * Retrieves the top relevant chunks for a question using keyword matching score (local term-frequency index).
 * @param {string} text - The massive document text.
 * @param {string} question - The user's query.
 * @param {number} topK - How many chunks to return.
 * @returns {string[]}
 */
export function retrieveRelevantChunks(text, question, topK = 3) {
  const chunks = chunkText(text);
  if (chunks.length <= topK) return chunks;

  const queryTerms = tokenize(question);
  if (queryTerms.length === 0) return chunks.slice(0, topK);

  const scoredChunks = chunks.map(chunk => {
    const chunkTerms = tokenize(chunk);
    const chunkTermSet = new Set(chunkTerms);
    
    // Calculate simple relevance density score
    let score = 0;
    queryTerms.forEach(term => {
      if (chunkTermSet.has(term)) {
        const matches = chunkTerms.filter(t => t === term).length;
        score += matches * 2; // match weight
      }
    });

    return { chunk, score };
  });

  // Sort by score descending and return the top K
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk);
}
