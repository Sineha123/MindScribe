/**
 * ollama.service.js — Ollama Local LLM Integration
 *
 * Ollama is a local LLM runner that lets you run open-source models
 * (Llama 3, Mistral, Phi-3, Gemma, etc.) entirely on your machine —
 * no API keys, no cloud, no costs.
 *
 * API Docs: https://github.com/ollama/ollama/blob/main/docs/api.md
 *
 * Setup:
 *   1. Install Ollama: https://ollama.com/download
 *   2. Pull a model: `ollama pull llama3.2` or `ollama pull mistral`
 *   3. Set OLLAMA_BASE_URL=http://localhost:11434 in .env
 *   4. Set LLM_PROVIDER=ollama in .env (or switch per-request)
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_TIMEOUT_MS = 120_000; // 2 minutes — local inference can be slow

// ─────────────────────────────────────────────────────────────────────────────
// CORE GENERATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a prompt to Ollama and returns the response text.
 *
 * Uses the /api/generate endpoint (non-streaming, synchronous).
 *
 * @param {string} prompt
 * @param {string} [model]
 * @returns {Promise<string>}
 */
export async function ollamaGenerate(prompt, model = OLLAMA_DEFAULT_MODEL) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 4096,  // max tokens
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const err = new Error(`Ollama error ${response.status}: ${errorText}`);
      err.statusCode = response.status === 404 ? 404 : 503;
      throw err;
    }

    const data = await response.json();
    return (data.response || '').trim();

  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Ollama request timed out after ${OLLAMA_TIMEOUT_MS / 1000}s`);
      timeoutErr.statusCode = 503;
      throw timeoutErr;
    }
    if (err.code === 'ECONNREFUSED' || err.cause?.code === 'ECONNREFUSED') {
      const connErr = new Error('Ollama is not running. Start it with: ollama serve');
      connErr.statusCode = 503;
      throw connErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL LISTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists all locally available Ollama models.
 * Returns an empty array if Ollama is not running (graceful degradation).
 *
 * @returns {Promise<{ name: string, size: string, modified: string }[]>}
 */
export async function listOllamaModels() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000), // 3s — fast check
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.models || []).map(m => ({
      name: m.name,
      size: formatSize(m.size),
      modified: m.modified_at,
    }));
  } catch {
    return []; // Ollama not running — graceful fallback
  }
}

/**
 * Checks whether Ollama is reachable.
 * @returns {Promise<boolean>}
 */
export async function isOllamaAvailable() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────

function formatSize(bytes) {
  if (!bytes) return 'unknown';
  const gb = bytes / 1024 / 1024 / 1024;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}
