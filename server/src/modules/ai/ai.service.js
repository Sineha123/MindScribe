/**
 * ai.service.js — Unified LLM Service with Provider Abstraction + MCP
 *
 * Supports two LLM providers:
 *   - Gemini  (Google, cloud, requires API key)
 *   - Ollama  (local, open-source, no API key needed)
 *
 * All prompts flow through the MCP (Model Context Protocol) layer which:
 *   - Injects BM25-ranked RAG context from the document
 *   - Adds session history for coherent multi-turn conversations
 *   - Declares available tools in a structured format
 *
 * Provider selection:
 *   - Set LLM_PROVIDER=gemini or LLM_PROVIDER=ollama in .env
 *   - Or pass { provider, ollamaModel } in the request for per-request override
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ollamaGenerate } from "../../services/ollama.service.js";
import { retrieveRelevantChunks } from "../../services/rag.service.js";
import { buildMCPEnvelope, buildMCPPrompt, addToSession } from "../../services/mcp.service.js";

const DEFAULT_PROVIDER = process.env.LLM_PROVIDER || 'gemini';

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER LAYER
// ─────────────────────────────────────────────────────────────────────────────



function getGeminiModel(clientApiKey, modelName = 'gemini-2.5-flash') {
  const key = clientApiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error("GEMINI_API_KEY is missing. Add it to server/.env or provide it in the UI settings.");
    err.statusCode = 401;
    err.code = 'API_KEY_MISSING';
    throw err;
  }
  const client = new GoogleGenerativeAI(key);
  return client.getGenerativeModel({ model: modelName });
}

// Fallback model chain: 2.5-flash → 2.0-flash → 1.5-flash
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

/**
 * Universal generate function — routes to Gemini or Ollama based on provider.
 *
 * @param {string} prompt
 * @param {string} [apiKey]      - Gemini API key (ignored for Ollama)
 * @param {string} [provider]    - 'gemini' | 'ollama'
 * @param {string} [ollamaModel] - Ollama model name override
 */
async function generate(prompt, apiKey, provider = DEFAULT_PROVIDER, ollamaModel) {
  if (provider === 'ollama') {
    return ollamaGenerate(prompt, ollamaModel || process.env.OLLAMA_MODEL || 'llama3.2');
  }

  // Gemini path — try models in fallback chain
  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = getGeminiModel(apiKey, modelName);
      const result = await model.generateContent(prompt);
      if (modelName !== GEMINI_MODELS[0]) {
        console.log(`[AI] Fell back to ${modelName} (primary model unavailable)`);
      }
      return result.response.text().trim();
    } catch (error) {
      lastError = error;

      // Precisely narrow to real auth errors — stop immediately
      const isAuthError = (
        error.status === 401 ||
        error.status === 403 ||
        (error.message && (
          error.message.includes('API key not valid') ||
          error.message.includes('PERMISSION_DENIED') ||
          error.message.includes('UNAUTHENTICATED') ||
          error.message.includes('API_KEY_INVALID')
        ))
      );
      if (isAuthError) {
        const authErr = new Error("API_KEY_INVALID");
        authErr.statusCode = 401;
        authErr.code = 'API_KEY_INVALID';
        throw authErr;
      }

      // For 503 / overload, try next model in chain
      const isOverload = error.status === 503 ||
        (error.message && (
          error.message.includes('503') ||
          error.message.includes('high demand') ||
          error.message.includes('overloaded') ||
          error.message.includes('Service Unavailable')
        ));

      if (!isOverload) {
        // Non-retriable error — throw immediately
        error.statusCode = error.statusCode || 500;
        throw error;
      }

      console.warn(`[AI] ${modelName} overloaded, trying next model...`);
    }
  }

  // All models failed
  const overloadErr = new Error("All Gemini models are currently overloaded. Please try again in a moment, or switch to Ollama in the AI panel.");
  overloadErr.statusCode = 503;
  throw overloadErr;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function generateSmartNotes(text, language = 'English', apiKey, provider, ollamaModel) {
  const envelope = buildMCPEnvelope({
    documentText: text,
    userMessage: 'Generate comprehensive structured study notes from this document.',
    language,
    tool: 'generate_notes',
  });

  const mcpContext = buildMCPPrompt(envelope);

  const prompt = `${mcpContext}
You are a professional knowledge engineer and elite educational content creator.
Create detailed, comprehensive, structured, and plagiarism-free study notes from the DOCUMENT CONTEXT above.
Use HTML tags suitable for a rich text editor (h1, h2, ul, li, p, strong, blockquote, em).
Respond strictly in ${language}.

Structure the notes using this educational framework:
1. 📌 CORE KEYWORDS: List 5-10 important terms with clear definitions.
2. 📝 COMPREHENSIVE GUIDE: 3-5 rich, detailed paragraphs explaining the content.
3. 🔍 KEY CONCEPTS EXPLAINED: 5-8 sub-concepts with real-world examples.
4. ❓ FREQUENTLY ASKED QUESTIONS: Q&A section addressing common confusion points.
5. 💡 PRACTICAL APPLICATIONS & LEARNING GOALS: Takeaways and real-world uses.

Generate only the HTML content, no markdown backticks or code fences.`;

  const result = await generate(prompt, apiKey, provider, ollamaModel);
  addToSession('default', 'assistant', 'Generated smart notes');
  return result;
}

export async function generateSummary(text, type = 'concise', language = 'English', apiKey, provider, ollamaModel) {
  const prompt = `You are an expert summary writer. Summarize the following content in a ${type} manner.
Respond strictly in ${language}. Use HTML formatting (p, ul, li, strong).

Provide:
- A brief overall summary (2-3 paragraphs).
- Key bullet points covering main ideas.

Content:
${text}`;

  return generate(prompt, apiKey, provider, ollamaModel);
}

export async function askQuestion(content, question, language = 'English', apiKey, provider, ollamaModel, projectId = 'default') {
  // Use BM25 RAG to retrieve the most relevant chunks
  const retrievedContexts = retrieveRelevantChunks(content, question, 4);
  const contextString = retrievedContexts.join('\n\n---\n\n');

  // Build MCP envelope for session tracking
  const envelope = buildMCPEnvelope({
    documentText: content,
    userMessage: question,
    projectId,
    language,
    tool: 'answer_question',
  });

  const prompt = `${buildMCPPrompt(envelope)}
You are a professional educational assistant.
Answer the following question based ONLY on the document context retrieved above.
Respond strictly in ${language}. Use HTML formatting (p, ul, li, strong, em).

Question: ${question}

Instructions:
1. Base your answer directly on the retrieved context segments.
2. If the context doesn't contain the answer, say so and provide the closest inference.
3. Include clear definitions and keep explanations accessible.
4. Cite which part of the document supports your answer.`;

  const result = await generate(prompt, apiKey, provider, ollamaModel);
  addToSession(projectId, 'user', question);
  addToSession(projectId, 'assistant', result);
  return result;
}

export async function explainContent(content, level = 'beginner', language = 'English', apiKey, provider, ollamaModel) {
  const prompt = `Explain the following content to a ${level} learner.
Use a friendly teaching style with HTML formatting (h2, p, ul, li, strong).
Respond strictly in ${language}.

Content:
${content}`;

  return generate(prompt, apiKey, provider, ollamaModel);
}

export async function generateVisuals(text, language = 'English', apiKey, provider, ollamaModel) {
  const prompt = `You are an expert educational visualizer specializing in creating stunning, information-dense infographics like those used in educational textbooks and professional explainer content (similar to VPS Hosting explained with flowcharts, Feistel Cipher architecture diagrams, and comic-style storytelling panels).

Analyze the following text and return a valid JSON object enclosed in \`\`\`json and \`\`\` containing:

1. "infographicHtml": A rich, beautifully styled HTML string that creates an INFOGRAPHIC STORYBOARD. Requirements:
   - Use a numbered-section layout (1. What is X?, 2. Architecture/Flow, 3. How it Works?, 4. Key Concepts, 5. Benefits, 6. Summary)
   - Each section should be a styled card with a header, icon emoji, and content
   - Use CSS Grid with inline styles for layout (do NOT use Tailwind, use only inline styles)
   - Color scheme: dark background (#1a1a2e), card backgrounds (#16213e), accent colors (#0f3460, #e94560, #533483)
   - Include flowchart-style boxes with arrows (use HTML entities: &rarr; &darr;) and connecting elements
   - Use tables for comparisons, ordered lists for steps, badge-style spans for key terms
   - Respond strictly in ${language}

2. "flowchart": A complete Mermaid.js flowchart string. CRITICAL RULES for valid Mermaid syntax:
   - Use "graph TD" direction
   - Node labels MUST NOT contain parentheses () — replace with square brackets or remove them
   - Node labels MUST NOT contain special chars like colons : slashes / or quotes "
   - Use simple alphanumeric labels only: A[Simple Label] B[Another Label]
   - Add relationship labels: A -->|describes| B
   - Include 8-12 nodes with subgraph groupings
   - Example: graph TD\\n  subgraph Core\\n    A[Main Concept]\\n    B[Sub Concept]\\n  end\\n  A -->|leads to| B

3. "graph": A knowledge graph with:
   - "nodes": array of { "id": string, "group": 1|2|3, "size": 8-16 }
   - "links": array of { "source": string, "target": string, "label": string }
   - 10-18 nodes, 12-20 links

Content:
${text}

IMPORTANT: Return ONLY the JSON block. Valid JSON, no trailing commas. Node labels in flowchart must use only simple text with no special characters.`;

  const responseText = await generate(prompt, apiKey, provider, ollamaModel);

  const match = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
  const cleanJson = match ? match[1] : responseText;

  try {
    const parsed = JSON.parse(cleanJson.trim());
    if (!parsed.graph) parsed.graph = { nodes: [], links: [] };
    if (!parsed.graph.nodes) parsed.graph.nodes = [];
    if (!parsed.graph.links) parsed.graph.links = [];
    return parsed;
  } catch (error) {
    console.error("Failed to parse visual data from AI:", error.message);
    return {
      infographicHtml: `<div style="padding:24px;background:#16213e;border-radius:12px;border:1px solid #0f3460;color:#e0e0e0;text-align:center;font-family:Inter,sans-serif">
        <div style="font-size:48px;margin-bottom:16px">🧠</div>
        <h3 style="color:#e94560;margin:0 0 8px 0">Visual Generation Failed</h3>
        <p style="color:#a0a0b0;margin:0">Please try AI Synthesize again. Raw response was: ${responseText.substring(0, 200)}...</p>
      </div>`,
      flowchart: "graph TD\n  A[Input Content] -->|processed by| B[AI Engine]\n  B -->|extracts| C[Key Concepts]\n  C -->|generates| D[Visual Insights]\n  D -->|displayed as| E[Infographic]",
      graph: {
        nodes: [
          { id: "Content", group: 1, size: 14 },
          { id: "Analysis", group: 1, size: 12 },
          { id: "Concepts", group: 2, size: 10 },
          { id: "Visuals", group: 3, size: 8 }
        ],
        links: [
          { source: "Content", target: "Analysis", label: "feeds into" },
          { source: "Analysis", target: "Concepts", label: "extracts" },
          { source: "Concepts", target: "Visuals", label: "renders as" }
        ]
      }
    };
  }
}
