# 🧠 MindScribe — AI Learning & Knowledge Workspace with LLM + RAG + MCP

MindScribe is a production-grade, full-stack AI-powered learning environment that transforms raw text and documents into structured study guides, interactive knowledge visualizations, and audio narrations.

Featuring a **dual LLM engine** (Google Gemini + local Ollama), a **BM25 RAG pipeline**, and a **Model Context Protocol (MCP)** context layer — all inside a premium glassmorphic dashboard.

---

## 📸 App Screenshots

### 🏠 Home Page
![Home Page](./docs/images/home.png)

### 📂 Project Page
![Project Page](./docs/images/project.png)

### 📝 Document Editor & AI Synthesis
![Document Editor](./docs/images/document.png)

### 📊 AI Visuals & Custom Studio
![Visuals](./docs/images/visuals.png)

---

## 🌟 1. System Architecture

```
                          ┌─────────────────────────────────────────┐
                          │         MindScribe UI  (React 19)        │
                          │  📊 Storyboard · 🔀 Flow · 🕸 Graph      │
                          └──────────────┬──────────────────────────┘
                                         │ Axios / REST
         ┌───────────────────────────────┼──────────────────────────────┐
         ▼                               ▼                              ▼
  ┌──────────────┐               ┌──────────────┐               ┌──────────────┐
  │  Rich Editor │               │Visual Panels │               │Notes Narrator│
  │  (Tiptap)    │               │(D3·Mermaid)  │               │(Web Speech)  │
  └──────┬───────┘               └──────┬───────┘               └──────────────┘
         │ Auto-saves (3s debounce)     │ AI-generated visuals
         ▼                              ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │                       Express API Server (Node.js ESM)                       │
  ├──────────────────────────────────────────────────────────────────────────────┤
  │  /api/upload   → PDF / DOCX text extraction (Multer + pdf-parse + Mammoth)  │
  │  /api/ai       → Notes · Summary · Q&A · Explain · Visuals · Providers      │
  │  /api/projects → CRUD workspace document persistence                        │
  └────────────────────────────────┬─────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
  │  MCP Layer       │   │  BM25 RAG Engine │   │  MongoDB Store   │
  │  (mcp.service)   │   │  (rag.service)   │   │  (Mongoose)      │
  │                  │   │                  │   │                  │
  │ • Context env.   │   │ • Sliding window │   │ • Projects CRUD  │
  │ • Session ring   │◄──│ • BM25 scoring   │   │ • Visual persist │
  │ • Tool decl.     │   │ • Top-K chunks   │   │ • Auto-save sync │
  └────────┬─────────┘   └──────────────────┘   └──────────────────┘
           │
           ▼ Structured MCP Prompt Envelope
  ┌──────────────────────────────────────────────────────────────┐
  │                    LLM Provider Layer                        │
  ├───────────────────────────┬──────────────────────────────────┤
  │   🌐 Google Gemini         │   🖥️ Ollama (Local LLM)          │
  │   gemini-2.5-flash        │   llama3.2 · mistral · phi3 ...  │
  │   Cloud · API key         │   Local · No key · Free          │
  └───────────────────────────┴──────────────────────────────────┘
```

### Core Data Pipelines
1. **Document Import**: File → Multer → pdf-parse/Mammoth → HTML → Editor
2. **AI Synthesis**: Editor text → BM25 RAG → MCP envelope → LLM (Gemini/Ollama) → Smart notes + visuals
3. **Autosave**: Keystroke delta → 3s debounce → Mongoose PUT → `Auto-saved ✓`
4. **RAG Q&A**: Question → BM25 chunk scoring → Top-4 context → MCP injection → LLM answer

---

## 📂 2. Repository Structure

```bash
MindScribe/
├── core/                          # Text processing engine
│   ├── analysis/
│   │   ├── keywordEngine.js       # Word frequency models
│   │   └── summaryEngine.js       # Sentence ranking
│   ├── text/
│   │   ├── cleaner.js             # Normalization
│   │   └── tokenizer.js           # Sentence splitter
│   └── index.js                   # Core pipeline entry
│
├── server/                        # Express API Gateway (ESM)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connector
│   │   ├── modules/
│   │   │   ├── ai/
│   │   │   │   ├── ai.routes.js   # REST endpoints + /providers + /context
│   │   │   │   └── ai.service.js  # Unified LLM service (Gemini + Ollama)
│   │   │   └── projects/
│   │   │       ├── project.model.js   # Mongoose schema
│   │   │       ├── project.routes.js  # CRUD controller
│   │   │       └── project.service.js # DB operations
│   │   ├── routes/
│   │   │   ├── export.routes.js   # DOCX/PDF export
│   │   │   ├── notes.routes.js    # Text processor
│   │   │   └── upload.routes.js   # File upload
│   │   ├── services/
│   │   │   ├── mcp.service.js     # ★ Model Context Protocol layer
│   │   │   ├── ollama.service.js  # ★ Local Ollama LLM client
│   │   │   ├── rag.service.js     # ★ BM25 RAG engine (upgraded)
│   │   │   ├── export.service.js  # HTML-to-Word packer
│   │   │   ├── notes.service.js   # Text processor bridge
│   │   │   └── upload.service.js  # Document parsers
│   │   ├── app.js                 # Express initialization
│   │   └── server.js              # Port server starter
│   ├── package.json
│   └── .env                       # ★ LLM_PROVIDER + OLLAMA_* vars
│
├── client/                        # Vite Frontend (React 19 + Tailwind v4)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   └── AIResponsePanel.jsx  # ★ LLM selector + RAG badge
│   │   │   ├── flow/
│   │   │   │   ├── FlowchartPanel.jsx   # ★ Mermaid + sanitizer
│   │   │   │   └── InfographicPanel.jsx # Visual storyboard
│   │   │   ├── graph/
│   │   │   │   └── ConceptGraph.jsx     # D3 BM25 knowledge graph
│   │   │   ├── editor/
│   │   │   │   └── RichEditor.jsx       # Tiptap editor
│   │   │   ├── layout/
│   │   │   │   └── Sidebar.jsx          # Project explorer
│   │   │   └── voice/
│   │   │       └── VoiceControls.jsx    # Speech narrator
│   │   ├── pages/
│   │   │   └── Dashboard.jsx            # State orchestrator
│   │   ├── services/
│   │   │   └── api.js                   # ★ Provider-aware Axios service
│   │   └── utils/
│   │       └── exportUtils.js           # Client PDF engine
│   └── package.json
│
└── README.md
```

---

## 🛠️ 3. Key Technical Components

### A. BM25 RAG Engine (`rag.service.js`)

MindScribe uses **Okapi BM25** — the same probabilistic ranking algorithm used by Elasticsearch, Lucene, and Solr — for retrieving relevant document chunks before each LLM call.

**How it works:**
1. **Sliding-Window Chunker**: Text is split into ~1500-char chunks with **15% overlap**, ensuring concepts spanning chunk boundaries are never lost.
2. **IDF Index**: An Inverted Document Frequency index is built over all chunks. Rare terms score higher.
3. **BM25 Scoring**:
   ```
   BM25(D,Q) = Σ IDF(qi) × [tf(qi,D)×(k1+1)] / [tf(qi,D) + k1×(1-b + b×|D|/avgdl)]
   ```
   Where `k1=1.5` (term saturation) and `b=0.75` (length normalization).
4. **Top-K Retrieval**: The 4 highest-scoring chunks are returned for context injection.

### B. MCP — Model Context Protocol (`mcp.service.js`)

The **Model Context Protocol** is a standardized envelope format for structured LLM context passing. Instead of raw text injection, MCP wraps all inputs in a typed schema:

```json
{
  "protocol": "MCP/1.0",
  "context": {
    "document": { "title": "...", "wordCount": 1200, "language": "English" },
    "rag": {
      "strategy": "BM25",
      "chunksRetrieved": 4,
      "chunks": [{ "text": "...", "score": 3.14, "index": 2, "wordCount": 180 }]
    },
    "session": { "projectId": "abc123", "history": [{ "role": "user", "content": "..." }] },
    "tools": ["generate_notes", "answer_question", "generate_visuals"],
    "activeTool": "generate_notes"
  },
  "user_message": "..."
}
```

**Benefits:**
- Provider-agnostic — same envelope works for Gemini, Ollama, or any future LLM
- Session memory via a **rolling ring buffer** (6 last exchanges per project)
- Structured tool declarations tell the LLM what capabilities are available
- Debug endpoint: `POST /api/ai/context` returns the live envelope

### C. Dual LLM Engine — Gemini + Ollama

| Feature | Google Gemini | Ollama (Local) |
|---|---|---|
| Model | `gemini-2.5-flash` | `llama3.2`, `mistral`, `phi3`, etc. |
| Setup | API key from aistudio.google.com | Install + `ollama pull <model>` |
| Privacy | Cloud (data sent to Google) | 100% local — data never leaves machine |
| Cost | Free tier + paid | Completely free |
| Speed | Fast (cloud) | Depends on hardware |
| Switch | `LLM_PROVIDER=gemini` | `LLM_PROVIDER=ollama` |

Switch per-request from the **AI Panel** in the sidebar — Gemini/Ollama toggle with live status indicator.

### D. Mermaid Flowchart Sanitizer

AI-generated Mermaid diagrams often contain syntax errors (parentheses in labels, special characters). The `sanitizeMermaid()` function in `FlowchartPanel.jsx` automatically fixes:
- `[Node (with parens)]` → `[Node with parens]` (strips parens from square labels)
- `"` → `'` (converts double quotes)
- `:` → ` -` (replaces colons)
- Falls back to a minimal diagram if sanitization still fails

### E. Tiptap Editor + Auto-Save
- 3-second debounced Mongoose `PUT` sync
- Status indicators: `● Unsaved` → `Syncing...` → `Auto-saved ✓`

### F. D3 Force Knowledge Graph
- BM25 node sizing — more important concepts render larger
- Group color-coding: 🔴 Core / 🟣 Sub-Concept / 🔵 Detail
- Zoom/pan with reset, interactive drag, tooltips, glow filters

### G. Speech Synthesis Narrator
- Native `window.speechSynthesis` API, 0.5x–2.0x speed control
- HTML-stripped narration for smooth audio output

---

## 🔌 4. API Endpoints

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/notes` | Generate structured study notes |
| POST | `/api/ai/summary` | Generate concise/detailed summary |
| POST | `/api/ai/ask` | BM25 RAG Q&A with session memory |
| POST | `/api/ai/explain` | Explain at beginner/intermediate/advanced |
| POST | `/api/ai/visuals` | Generate infographic + flowchart + graph |
| GET  | `/api/ai/providers` | List Gemini + Ollama status and models |
| POST | `/api/ai/context` | Debug — return current MCP envelope |

**Provider endpoint response:**
```json
{
  "active": "gemini",
  "providers": [
    { "id": "gemini", "model": "gemini-2.5-flash", "status": "configured", "cloud": true },
    { "id": "ollama", "model": "llama3.2", "status": "online", "cloud": false,
      "models": [{ "name": "llama3.2", "size": "2.0 GB" }] }
  ]
}
```

### Projects CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/projects` | List all workspace documents |
| GET  | `/api/projects/:id` | Fetch single project |
| POST | `/api/projects` | Create new project |
| PUT  | `/api/projects/:id` | Update existing project |
| DELETE | `/api/projects/:id` | Delete project |

---

## ⚙️ 5. Setup & Launch

### Prerequisites
- **Node.js** 18+
- **MongoDB** running locally (port 27017) or Atlas
- **Ollama** (optional) — install from [ollama.com](https://ollama.com)

### 1. Environment Configuration

**`server/.env`:**
```env
GEMINI_API_KEY=your_key_from_aistudio.google.com
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/mindscribe

# LLM Provider: gemini | ollama
LLM_PROVIDER=gemini

# Ollama (local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 2. Ollama Setup (Optional — for local AI)
```bash
# 1. Install Ollama from https://ollama.com/download
# 2. Start server
ollama serve

# 3. Pull a model (choose based on your RAM)
ollama pull llama3.2        # ~2GB — fast, good quality
ollama pull mistral         # ~4GB — excellent reasoning
ollama pull phi3            # ~2GB — Microsoft's efficient model
ollama pull gemma2          # ~5GB — Google's open model

# 4. Set in .env
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
```

### 3. Launch Backend
```bash
cd server
npm install
node src/server.js
# ✓ MongoDB connected: mongodb://127.0.0.1:27017/mindscribe
# ✓ Running on: http://localhost:3000
```

### 4. Launch Frontend
```bash
cd client
npm install
npm run dev
# ✓ VITE ready → http://localhost:5173/
```

---

## 🔍 6. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `502 Bad Gateway` | Backend not running | `cd server && node src/server.js` |
| `400 Bad Request on /api/ai/notes` | Empty text body | Check editor has content before synthesizing |
| `Mermaid parse error (React App)` | Parentheses in node labels | Fixed by `sanitizeMermaid()` in FlowchartPanel |
| `Ollama: ECONNREFUSED` | Ollama not running | Run `ollama serve` in a terminal |
| `MongoDB connection failed` | MongoDB not running | Start MongoDB service |
| `API_KEY_INVALID` | Wrong Gemini key | Get key from [aistudio.google.com](https://aistudio.google.com) |

---

## ✅ 7. Validation Story

1. Open `http://localhost:5173` — premium 3D background loads
2. Click **"+ New Project"** — auto-saved to MongoDB
3. Import a PDF or type text in the editor
4. Click **"AI Synthesize"** — watch it auto-switch to Visuals tab showing:
   - 📊 **Storyboard** — rich infographic panels
   - 🔀 **Flow** — Mermaid architecture diagram
   - 🕸 **Graph** — D3 interactive knowledge graph with zoom/pan
5. Switch to **Ollama** in the AI panel sidebar, pick a model, ask a question
6. Watch the **RAG chunks badge** appear showing how many BM25-ranked chunks were used
7. Click **Play** on the Narrator bar — notes read aloud
8. Click **Export PDF** — formatted PDF downloaded
