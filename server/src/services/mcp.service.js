/**
 * mcp.service.js — Model Context Protocol (MCP) Layer
 *
 * What is MCP?
 *   The Model Context Protocol is a standardized envelope format for passing
 *   structured context to LLMs. Instead of injecting raw text into prompts,
 *   MCP wraps inputs in a typed schema: document metadata, RAG chunks,
 *   session history, available tools, and the user's intent.
 *
 *   This enables:
 *   - Consistent prompt engineering across multiple LLM providers
 *   - Structured context that any LLM (Gemini, Ollama, OpenAI) can follow
 *   - Session memory with a rolling conversation ring buffer
 *   - Tool declarations so the LLM knows what actions it can take
 *
 * Inspired by: https://modelcontextprotocol.io/
 */

import { retrieveScoredChunks, getDocumentStats } from './rag.service.js';

// ─────────────────────────────────────────────────────────────────────────────
// SESSION HISTORY (in-memory ring buffer, keyed by projectId)
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_MAX = 6; // max exchanges stored per session
const sessions = new Map();  // projectId → [{ role, content }]

/**
 * Appends an exchange to the session history.
 * Rolls off the oldest entry when limit is exceeded.
 */
export function addToSession(projectId, role, content) {
  if (!sessions.has(projectId)) sessions.set(projectId, []);
  const history = sessions.get(projectId);
  history.push({ role, content: content.substring(0, 500) }); // trim for storage
  if (history.length > SESSION_MAX) history.shift();
}

/**
 * Returns the current session history for a project.
 */
export function getSession(projectId) {
  return sessions.get(projectId) || [];
}

/**
 * Clears a project's session history.
 */
export function clearSession(projectId) {
  sessions.delete(projectId);
}

// ─────────────────────────────────────────────────────────────────────────────
// MCP ENVELOPE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

const AVAILABLE_TOOLS = [
  { name: 'generate_notes',    description: 'Synthesize structured study notes from document text' },
  { name: 'generate_summary',  description: 'Create a concise or detailed summary' },
  { name: 'answer_question',   description: 'Answer a specific question using document context' },
  { name: 'explain_content',   description: 'Explain content at beginner/intermediate/advanced level' },
  { name: 'generate_visuals',  description: 'Create infographic HTML, Mermaid flowchart, and knowledge graph' },
];

/**
 * Builds a structured MCP context envelope.
 *
 * @param {object} opts
 * @param {string} opts.documentText    - Full plain-text content of the document
 * @param {string} opts.userMessage     - The user's query or task description
 * @param {string} [opts.projectId]     - Project ID for session lookup
 * @param {string} [opts.language]      - Language for response
 * @param {string} [opts.tool]          - Which tool is being invoked
 * @param {string} [opts.documentTitle] - Project name
 * @returns {object} MCP envelope
 */
export function buildMCPEnvelope({
  documentText = '',
  userMessage = '',
  projectId = 'default',
  language = 'English',
  tool = 'generate_notes',
  documentTitle = 'Untitled Document',
}) {
  const stats = getDocumentStats(documentText);
  const ragChunks = documentText
    ? retrieveScoredChunks(documentText, userMessage || documentText.substring(0, 200), 4)
    : [];
  const session = getSession(projectId);

  return {
    protocol: 'MCP/1.0',
    timestamp: new Date().toISOString(),
    context: {
      document: {
        title: documentTitle,
        language,
        wordCount: stats.wordCount,
        chunkCount: stats.chunkCount,
        charCount: stats.charCount,
      },
      rag: {
        strategy: 'BM25',
        chunksRetrieved: ragChunks.length,
        chunks: ragChunks.map(c => ({
          text: c.text,
          score: Math.round((c.score || 0) * 100) / 100,
          index: c.index,
          wordCount: c.wordCount,
        })),
      },
      session: {
        projectId,
        historyLength: session.length,
        history: session,
      },
      tools: AVAILABLE_TOOLS,
      activeTool: tool,
    },
    user_message: userMessage,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts an MCP envelope into a formatted LLM prompt preamble.
 * This is injected before the task-specific prompt.
 *
 * @param {object} envelope - MCP envelope from buildMCPEnvelope()
 * @returns {string} formatted context block
 */
export function buildMCPPrompt(envelope) {
  const { context, user_message } = envelope;
  const { document, rag, session } = context;

  const ragBlock = rag.chunks.length > 0
    ? rag.chunks.map((c, i) =>
        `[Chunk ${i + 1} | Score: ${c.score} | Words: ${c.wordCount}]\n${c.text}`
      ).join('\n\n---\n\n')
    : 'No document context available.';

  const sessionBlock = session.history.length > 0
    ? session.history.map(h => `[${h.role.toUpperCase()}]: ${h.content}`).join('\n')
    : 'No previous exchanges.';

  return `
=== MODEL CONTEXT PROTOCOL (MCP/1.0) ===
Document: "${document.title}" | Language: ${document.language} | Words: ${document.wordCount}
RAG Strategy: ${rag.strategy} | Chunks Retrieved: ${rag.chunksRetrieved}

--- RETRIEVED DOCUMENT CONTEXT (BM25 Ranked) ---
${ragBlock}

--- SESSION HISTORY ---
${sessionBlock}

--- USER REQUEST ---
${user_message}
=== END MCP CONTEXT ===

`;
}
