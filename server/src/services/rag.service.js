/**
 * rag.service.js — Enhanced BM25 Retrieval-Augmented Generation Engine
 *
 * Architecture:
 *   Raw Text → Sliding-Window Chunker → BM25 Scorer → Top-K Retriever
 *
 * Improvements over basic TF matching:
 *   - BM25 (Okapi BM25): industry-standard probabilistic ranking function
 *     used by Elasticsearch, Lucene, and Solr for document retrieval.
 *   - Sliding window chunking with 15% overlap ensures cross-boundary
 *     context is never lost at chunk seams.
 *   - Returns scored chunk metadata for MCP context injection.
 */

// BM25 constants (tuned defaults from IR literature)
const BM25_K1 = 1.5;   // Term saturation — higher = more weight to repeated terms
const BM25_B  = 0.75;  // Length normalization — 0=no norm, 1=full norm

// ─────────────────────────────────────────────────────────────────────────────
// CHUNKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits text into overlapping sliding-window chunks.
 * Overlap ensures concepts that span chunk boundaries are captured.
 *
 * @param {string} text
 * @param {number} chunkSize  - Target character length per chunk
 * @param {number} overlap    - Overlap ratio (0–1), default 15%
 * @returns {{ text: string, index: number, wordCount: number }[]}
 */
export function chunkText(text, chunkSize = 1500, overlap = 0.15) {
  if (!text || !text.trim()) return [];

  // Split on sentence boundaries to avoid mid-sentence cuts
  const sentences = text.match(/[^.!?\n]+[.!?\n]+(\s|$)/g) || [text];
  const chunks = [];
  let current = '';
  let overlapBuffer = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize) {
      if (current.trim()) {
        const trimmed = current.trim();
        chunks.push({
          text: trimmed,
          index: chunks.length,
          wordCount: trimmed.split(/\s+/).length,
        });

        // Carry over the trailing portion as overlap context
        const words = trimmed.split(/\s+/);
        const overlapWords = Math.floor(words.length * overlap);
        overlapBuffer = words.slice(-overlapWords).join(' ') + ' ';
      }
      current = overlapBuffer + sentence;
    } else {
      current += sentence;
    }
  }

  if (current.trim()) {
    const trimmed = (overlapBuffer + current).trim();
    chunks.push({
      text: trimmed,
      index: chunks.length,
      wordCount: trimmed.split(/\s+/).length,
    });
  }

  return chunks;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKENIZER
// ─────────────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'i','me','my','myself','we','our','ours','ourselves','you','your','yours',
  'him','his','himself','she','her','hers','herself','it','its','itself',
  'them','their','theirs','themselves','what','which','who','whom','this',
  'that','these','those','am','is','are','was','were','be','been','being',
  'have','has','had','having','do','does','did','doing','a','an','the',
  'and','but','if','or','because','as','until','while','of','at','by',
  'for','with','about','against','between','into','through','during','before',
  'after','above','below','to','from','up','down','in','out','on','off',
  'over','under','again','further','then','once','here','there','when',
  'where','why','how','all','any','both','each','few','more','most','other',
  'some','such','no','nor','not','only','own','same','so','than','too','very',
  's','t','can','will','just','don','should','now','also','get','like','use',
]);

function tokenize(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

// ─────────────────────────────────────────────────────────────────────────────
// BM25 SCORER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds an inverted IDF index over all chunks.
 * IDF = log((N - df + 0.5) / (df + 0.5) + 1)
 */
function buildIDF(chunks) {
  const N = chunks.length;
  const df = {};  // document frequency per term

  for (const chunk of chunks) {
    const terms = new Set(tokenize(chunk.text));
    for (const term of terms) {
      df[term] = (df[term] || 0) + 1;
    }
  }

  const idf = {};
  for (const [term, freq] of Object.entries(df)) {
    idf[term] = Math.log((N - freq + 0.5) / (freq + 0.5) + 1);
  }
  return idf;
}

/**
 * Scores a single chunk against query terms using BM25.
 *
 * BM25(D,Q) = Σ IDF(qi) * [ tf(qi,D)*(k1+1) / (tf(qi,D) + k1*(1-b+b*|D|/avgdl)) ]
 */
function bm25Score(queryTerms, chunkTerms, idf, avgDocLen) {
  const tf = {};
  for (const term of chunkTerms) {
    tf[term] = (tf[term] || 0) + 1;
  }

  const docLen = chunkTerms.length;
  let score = 0;

  for (const term of queryTerms) {
    if (tf[term]) {
      const termIDF = idf[term] || 0;
      const termTF = tf[term];
      const numerator = termTF * (BM25_K1 + 1);
      const denominator = termTF + BM25_K1 * (1 - BM25_B + BM25_B * (docLen / avgDocLen));
      score += termIDF * (numerator / denominator);
    }
  }
  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves the top-K most relevant chunks using BM25 scoring.
 *
 * @param {string} text     - Full document text
 * @param {string} question - User query
 * @param {number} topK     - Number of chunks to return
 * @returns {{ text: string, score: number, index: number, wordCount: number }[]}
 */
export function retrieveRelevantChunks(text, question, topK = 3) {
  const rawChunks = chunkText(text);
  if (rawChunks.length === 0) return [];
  if (rawChunks.length <= topK) return rawChunks.map(c => c.text);

  const queryTerms = tokenize(question);
  if (queryTerms.length === 0) return rawChunks.slice(0, topK).map(c => c.text);

  // Build IDF index
  const idf = buildIDF(rawChunks);
  const avgDocLen = rawChunks.reduce((sum, c) => sum + c.wordCount, 0) / rawChunks.length;

  // Score all chunks
  const scored = rawChunks.map(chunk => ({
    ...chunk,
    score: bm25Score(queryTerms, tokenize(chunk.text), idf, avgDocLen),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => c.text);
}

/**
 * Returns scored chunk metadata for MCP context injection.
 * Used by mcp.service.js to build structured context envelopes.
 *
 * @param {string} text
 * @param {string} question
 * @param {number} topK
 * @returns {{ text: string, score: number, index: number, wordCount: number }[]}
 */
export function retrieveScoredChunks(text, question, topK = 3) {
  const rawChunks = chunkText(text);
  if (rawChunks.length === 0) return [];

  const queryTerms = tokenize(question);
  if (queryTerms.length === 0) return rawChunks.slice(0, topK);

  const idf = buildIDF(rawChunks);
  const avgDocLen = rawChunks.reduce((sum, c) => sum + c.wordCount, 0) / rawChunks.length;

  return rawChunks
    .map(chunk => ({
      ...chunk,
      score: bm25Score(queryTerms, tokenize(chunk.text), idf, avgDocLen),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Returns basic document statistics for MCP envelope.
 * @param {string} text
 */
export function getDocumentStats(text) {
  if (!text) return { wordCount: 0, chunkCount: 0, charCount: 0 };
  const chunks = chunkText(text);
  return {
    wordCount: text.split(/\s+/).filter(Boolean).length,
    chunkCount: chunks.length,
    charCount: text.length,
  };
}
