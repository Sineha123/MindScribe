import express from "express";
import {
  askQuestion,
  explainContent,
  generateSummary,
  generateSmartNotes,
  generateVisuals
} from "./ai.service.js";
import { listOllamaModels, isOllamaAvailable } from "../../services/ollama.service.js";
import { buildMCPEnvelope } from "../../services/mcp.service.js";

const router = express.Router();

// Helper to extract provider settings from request
function getProviderOpts(req) {
  return {
    apiKey: req.headers['x-gemini-api-key'],
    provider: req.body.provider || req.headers['x-llm-provider'],
    ollamaModel: req.body.ollamaModel || req.headers['x-ollama-model'],
  };
}

// ─── POST /api/ai/notes ────────────────────────────────────────────────────
router.post("/notes", async (req, res, next) => {
  try {
    const { text, language } = req.body;
    if (!text || !text.trim()) {
      const err = new Error("Text content is required and cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    const { apiKey, provider, ollamaModel } = getProviderOpts(req);
    const result = await generateSmartNotes(text, language, apiKey, provider, ollamaModel);
    res.status(200).json({ success: true, data: result, provider: provider || 'gemini' });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/ai/summary ──────────────────────────────────────────────────
router.post("/summary", async (req, res, next) => {
  try {
    const { text, type, language } = req.body;
    if (!text) throw Object.assign(new Error("Text is required"), { statusCode: 400 });
    const { apiKey, provider, ollamaModel } = getProviderOpts(req);
    const result = await generateSummary(text, type, language, apiKey, provider, ollamaModel);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/ai/ask ──────────────────────────────────────────────────────
router.post("/ask", async (req, res, next) => {
  try {
    const { content, question, language, projectId } = req.body;
    if (!content || !question) {
      throw Object.assign(new Error("Both content and question are required"), { statusCode: 400 });
    }
    const { apiKey, provider, ollamaModel } = getProviderOpts(req);
    const result = await askQuestion(content, question, language, apiKey, provider, ollamaModel, projectId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/ai/explain ─────────────────────────────────────────────────
router.post("/explain", async (req, res, next) => {
  try {
    const { content, level, language } = req.body;
    if (!content) throw Object.assign(new Error("Content is required"), { statusCode: 400 });
    const { apiKey, provider, ollamaModel } = getProviderOpts(req);
    const result = await explainContent(content, level, language, apiKey, provider, ollamaModel);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/ai/visuals ─────────────────────────────────────────────────
router.post("/visuals", async (req, res, next) => {
  try {
    const { text, language } = req.body;
    if (!text) throw Object.assign(new Error("Text is required"), { statusCode: 400 });
    const { apiKey, provider, ollamaModel } = getProviderOpts(req);
    const result = await generateVisuals(text, language, apiKey, provider, ollamaModel);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/ai/providers ────────────────────────────────────────────────
// Returns available LLM providers and their status
router.get("/providers", async (req, res) => {
  const ollamaOnline = await isOllamaAvailable();
  const ollamaModels = ollamaOnline ? await listOllamaModels() : [];
  const geminiConfigured = !!(process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key']);

  res.status(200).json({
    success: true,
    data: {
      active: process.env.LLM_PROVIDER || 'gemini',
      providers: [
        {
          id: 'gemini',
          name: 'Google Gemini',
          model: 'gemini-2.5-flash',
          status: geminiConfigured ? 'configured' : 'no-key',
          cloud: true,
          description: 'Google\'s latest fast reasoning model. Requires API key from aistudio.google.com',
        },
        {
          id: 'ollama',
          name: 'Ollama (Local LLM)',
          model: process.env.OLLAMA_MODEL || 'llama3.2',
          status: ollamaOnline ? 'online' : 'offline',
          cloud: false,
          models: ollamaModels,
          description: 'Run open-source LLMs locally. Install from ollama.com, then: ollama pull llama3.2',
        },
      ],
    },
  });
});

// ─── POST /api/ai/context ─────────────────────────────────────────────────
// Debug endpoint — returns the current MCP context envelope for a document
router.post("/context", async (req, res, next) => {
  try {
    const { text, question, language, projectId, documentTitle } = req.body;
    const envelope = buildMCPEnvelope({
      documentText: text || '',
      userMessage: question || 'Show context',
      projectId: projectId || 'default',
      language: language || 'English',
      documentTitle: documentTitle || 'Untitled',
      tool: 'debug',
    });
    res.status(200).json({ success: true, data: envelope });
  } catch (error) {
    next(error);
  }
});

export default router;
