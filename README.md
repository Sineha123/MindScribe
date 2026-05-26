# 🧠 MindScribe — Premium AI Learning & Knowledge Workspace Platform

MindScribe is a production-grade, full-stack AI-powered learning environment that transforms raw text and imported documents into highly structured study guides, interactive knowledge visualizations, and audio narrations. 

Featuring a premium glassmorphic dashboard with a **Three.js** floating background WebGL canvas, MindScribe integrates standard educational systems into a single responsive, beautiful interface.

---

## 🌟 1. System Architecture & Core Pipelines

```
                             ┌──────────────────────────────────────┐
                             │       MindScribe UI (React 19)       │
                             └──────────────────┬───────────────────┘
                                                │
       ┌────────────────────────────────────────┼───────────────────────────────────────┐
       ▼                                        ▼                                       ▼
┌──────────────┐                        ┌──────────────┐                        ┌──────────────┐
│ Rich Editor  │                        │ Visual Panels│                        │Notes Narrator│
│(Tiptap Star) │                        │(D3 / ChartJS)│                        │(Web Speech)  │
└──────┬───────┘                        └──────┬───────┘                        └──────┬───────┘
       │ (Auto-saves every 30s)                │ (Keywords / Graphs)                   │ (Speaks Text)
       ▼                                        ▼                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Express API Server (Node.js)                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│  • /api/upload  → PDF Parsing & Docx Mammoth Text Extracting                                 │
│  • /api/ai      → Synthesizing study notes & generating concept graphs                      │
│  • /api/projects → Save, list, update, and delete active workspace documents                 │
└───────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        ▼                                               ▼
          ┌───────────────────────────┐                   ┌───────────────────────────┐
          │      Local RAG Index      │                   │      Database Store       │
          │    (Semantic Chunker)     │                   │     (MongoDB Mongoose)    │
          └─────────────┬─────────────┘                   └───────────────────────────┘
                        │
                        ▼ (Top-3 matched chunks)
          ┌───────────────────────────┐
          │     Google Gemini API     │
          │    (gemini-2.5-flash)     │
          └───────────────────────────┘
```

### Core Data Pipelines
1. **Document Import Pipeline**: File uploaded via Multer → `upload.service.js` parses PDF (using robust CJS createRequire workaround) or extracts text from DOCX (using Mammoth) → Text cleaned and returned as HTML formatting suitable for editor insertion.
2. **AI Synthesis Pipeline**: Editor content sent to `/api/ai/notes` and `/api/ai/visuals` → Gemini processes text to build Roman-Urdu study guides and returns semantic relation arrays → Sidebar automatically updates state and feeds coordinates directly to visual components.
3. **Workspace Autosave Pipeline**: State manager listens to keystroke delta → Auto-saves to Mongoose DB at 3-second idle intervals → Changes title subtitle to `Syncing...` → Returns success and changes state to `Auto-saved`.

---

## 📂 2. Repository Folder Structure

```bash
MindScribe/
│
├── core/                        # Text processing engine (CJS/ESM modules)
│   ├── analysis/
│   │   ├── keywordEngine.js     # Word frequency extraction models
│   │   ├── stopwords.js         # Text cleanup dictionaries
│   │   └── summaryEngine.js     # Sentence ranking models
│   ├── text/
│   │   ├── cleaner.js           # Smart quote, whitespace, & break normalization
│   │   └── tokenizer.js         # Sentence splitter utility
│   ├── generation/
│   │   └── notesBuilder.js      # Raw bullet note list output formatter
│   └── index.js                 # Core orchestrator pipeline entry
│
├── server/                      # Express API Gateway (Node ESM)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # MongoDB Mongoose connector
│   │   ├── modules/
│   │   │   ├── ai/
│   │   │   │   ├── ai.routes.js  # Synthesis, explanation, Q&A routes
│   │   │   │   └── ai.service.js # Gemini Generative model integration
│   │   │   └── projects/
│   │   │       ├── project.model.js  # Workspace project mongoose schema
│   │   │       ├── project.routes.js # Project CRUD controller endpoints
│   │   │       └── project.service.js# Mongoose save / findByIdAndUpdate logic
│   │   ├── routes/
│   │   │   ├── export.routes.js # Word / PDF export handler
│   │   │   ├── notes.routes.js  # Text processor service link
│   │   │   └── upload.routes.js # Multer file upload routes
│   │   ├── services/
│   │   │   ├── export.service.js# HTML-to-Word buffer packer
│   │   │   ├── notes.service.js # Text processor service bridge
│   │   │   ├── rag.service.js   # Local chunker & term matching RAG ranker
│   │   │   └── upload.service.js# pdf-parse / mammoth document parsers
│   │   ├── app.js               # Express application initialization
│   │   └── server.js            # Port server starter
│   ├── package.json
│   └── .env
│
├── client/                      # Vite Frontend Workspace (React 19 + Tailwind v4)
│   ├── src/
│   │   ├── assets/              # Premium fonts & images
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   └── AIResponsePanel.jsx # Sidebar Q&A chat & levels interface
│   │   │   ├── charts/
│   │   │   │   └── KeywordCharts.jsx   # Chart.js Keyword distribution charts
│   │   │   ├── editor/
│   │   │   │   └── RichEditor.jsx      # Tiptap toolbar & writing wrapper
│   │   │   ├── flow/
│   │   │   │   └── FlowchartPanel.jsx  # Mermaid.js flow diagram panel
│   │   │   ├── graph/
│   │   │   │   └── ConceptGraph.jsx    # D3 force-directed semantic graph panel
│   │   │   ├── layout/
│   │   │   │   └── Sidebar.jsx         # Live file explorer & Project CRUD list
│   │   │   ├── three/
│   │   │   │   └── Scene.jsx           # Three.js 3D WebGL background orb
│   │   │   └── voice/
│   │   │       └── VoiceControls.jsx   # Narration bar with speed controls
│   │   ├── pages/
│   │   │   └── Dashboard.jsx    # Central state orchestrator and workspace header
│   │   ├── services/
│   │   │   └── api.js           # Standard Axios service mappings
│   │   ├── utils/
│   │   │   └── exportUtils.js   # Client-side html2canvas + jsPDF engine
│   │   ├── main.jsx             # Entrypoint bootstrap
│   │   ├── index.css            # Tailwind import & custom glassmorphism styles
│   │   └── App.jsx              # Main routing & Scene overlay structure
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🛠️ 3. Deep Dive: Key Technical Components

### A. Tiptap Editor & Dynamic Auto-Save
The editing interface uses `@tiptap/react` configured with `StarterKit`, `TextStyle`, and `Color` extensions. It provides fully stylized outputs inside a glassmorphic frame.

* **Debounced Save Loop**:
  Keystrokes update the local editor state. An effect hook monitors changes and triggers a 3-second debounced save loop. If no typing occurs for 3 seconds, a Mongoose `PUT` sync call is launched, reducing DB load and safeguarding content.
* **Workspace Status Indicators**:
  * `● Unsaved changes` (Yellow status dot during typing).
  * `Syncing...` (Blue spinning loop showing MongoDB persistence in progress).
  * `Auto-saved` (Green checkmark confirming success).

### B. Custom Local Semantic RAG (Retrieval-Augmented Generation) Engine
To query massive 50MB PDFs without overloading the Gemini LLM context window or raising prompt costs, we implemented a custom semantic RAG model directly in Node ESM:

1. **Semantic Text Chunking** ([rag.service.js](server/src/services/rag.service.js)):
   Filters clean text into logical paragraph slices (approx. 1500 characters) by looking ahead for sentence ending punctuation (`.`, `!`, `?`) to avoid splitting sentences mid-thought.
2. **Relevance Weight Ranker**:
   Queries are tokenized and cleaned of standard stopwords. The chunk text is cataloged inside a local Term-Frequency index. Chunks are scored based on the occurrence density of query tokens:
   $$\text{Score}(c) = \sum_{t \in Q} \text{Freq}(t, c) \times 2$$
3. **Retrieval Q&A Context Injection**:
   The top 3 semantically ranked chunks are returned, separated by block delimiters, and injected as the `Retrieved Document Context` inside the Gemini prompt. This results in highly precise context answers.

### C. Bilingual Gemini Synthesis
The engine uses Google's `gemini-2.5-flash` model to analyze raw uploaded contents. The prompts are optimized to return:
* **📌 Core Keywords**: 5-10 terms defined in English with localized Roman-Urdu annotations.
* **📝 Comprehensive Paragraphs**: 3-5 verbose educational paragraphs covering the core topic.
* **🔍 Conceptual Analysis**: Detailed breakdown of 5-8 sub-concepts.
* **❓ FAQ Section**: A complete conceptual Q&A list addressing complex ideas.
* **💡 Learning Outcomes**: Core takeaways for student goals.

### D. 3D WebGL Canvas & Force-Directed Concept Mapping
* **Three.js Scene background** ([Scene.jsx](client/src/components/three/Scene.jsx)): 
  Uses `@react-three/fiber` and `@react-three/drei` to render a floating space mesh overlaying 5,000 active stellar particles. A central sphere distorting dynamically via lighting shaders (`MeshDistortMaterial`) responds elegantly to cursor movements.
* **D3Force Semantics** ([ConceptGraph.jsx](client/src/components/graph/ConceptGraph.jsx)):
  Binds D3 force simulation models to AI-generated relationship datasets. Concepts are color-coded by semantic categories (Core ideas vs. Supporting factors). It implements custom charge strengths to prevent overlap:
  ```javascript
  const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2));
  ```
* **Mermaid Flowcharting** ([FlowchartPanel.jsx](client/src/components/flow/FlowchartPanel.jsx)):
  Dynamically interprets Mermaid strings returned from Gemini to render system hierarchies and decision trees inside a custom dark glass frame.

### E. Speech Synthesis Narrator Bar
The audio control panel uses the native browser `window.speechSynthesis` API:
* ** playback Controls**: Play, Pause, Resume, and Stop controls mapped to state machine triggers.
* **Speed Shifting**: Lets users set speed rates ranging from `0.5x` (slow) up to `2.0x` (fast).
* **System Voice Detection**: Queries system voice matrices on startup to filter and load native high-definition English/Urdu voice engines.
* **HTML Sanitization**: Strains out all rich tags and formats before speaking to ensure smooth narration.

### F. Client-Side High-Fidelity PDF Print Engine
Rather than hosting heavy server-side Chromium instances (which are slow to download and prone to crashes on standard server platforms), PDF exports are compiled directly in the browser:
1. `html2canvas` captures the Tiptap container structure at double scale (`scale: 2`) with custom background-color values.
2. The canvas output is exported as a PNG buffer.
3. `jsPDF` maps the image into a physical A4 page using standard aspect-ratio formulas to avoid stretching or pixelation:
   $$\text{pdfHeight} = \frac{\text{canvasHeight} \times \text{pdfWidth}}{\text{canvasWidth}}$$

---

## 🔌 4. API Endpoints

### Projects CRUD Mappings

#### 1. Fetch All Workspace Documents
* **Endpoint**: `GET /api/projects`
* **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "603d2b...",
      "name": "Organic Chemistry Notes",
      "createdAt": "2026-05-26T10:00:00Z",
      "updatedAt": "2026-05-26T11:05:00Z"
    }
  ]
}
```

#### 2. Fetch Single Document
* **Endpoint**: `GET /api/projects/:id`
* **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "603d2b...",
    "name": "Organic Chemistry Notes",
    "text": "Organic chemistry is the study...",
    "editorContent": "<h1>Organic Chemistry</h1><p>Organic chemistry...</p>",
    "keywords": { "carbon": 10, "isomers": 8 },
    "flowchart": "graph TD\n  A[Hydrocarbons] --> B[Alkanes]",
    "graph": {
      "nodes": [ { "id": "Hydrocarbons", "group": 1 } ],
      "links": []
    }
  }
}
```

#### 3. Create or Save Project
* **Endpoint**: `POST /api/projects`
* **Request Body**:
```json
{
  "name": "Biology Notes",
  "editorContent": "<p>Biology study notes...</p>"
}
```
* **Response**: `201 Created`

#### 4. Update Existing Workspace
* **Endpoint**: `PUT /api/projects/:id`
* **Request Body**:
```json
{
  "name": "Modified Biology Notes",
  "editorContent": "<h1>Biology Study Notes</h1><p>Enriched content...</p>",
  "keywords": { "Mitosis": 9 }
}
```
* **Response**: `200 OK`

#### 5. Delete Workspace
* **Endpoint**: `DELETE /api/projects/:id`
* **Response**: `200 OK`

---

### AI Modules Mappings

#### 1. Synthesize Notes
* **Endpoint**: `POST /api/ai/notes`
* **Request**: `{ "text": "Raw transcript text..." }`
* **Response**: `{ "success": true, "data": "<h1>Smart Notes</h1>..." }`

#### 2. Generate Concept Diagrams
* **Endpoint**: `POST /api/ai/visuals`
* **Request**: `{ "text": "Rich notes text..." }`
* **Response**:
```json
{
  "success": true,
  "data": {
    "keywords": { "concept": 8 },
    "flowchart": "graph TD\n  A --> B",
    "graph": {
      "nodes": [ { "id": "A", "group": 1 }, { "id": "B", "group": 2 } ],
      "links": [ { "source": "A", "target": "B" } ]
    }
  }
}
```

---

## ⚙️ 5. Setup & Launch Instructions

### Prerequisites
* **Node.js**: Version 18.0.0 or higher.
* **MongoDB**: A running instance (local on port 27017 or Atlas cloud instance).

### 1. Environment Configurations
Setup `.env` configurations in both directories:

* **Backend `.env`** (`server/.env`):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/mindscribe
GEMINI_API_KEY=AIzaSyChGH6xuAN4ca...  # Obtain from aistudio.google.com
PORT=3000
```

* **Frontend `.env.local`** (`client/.env.local`):
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Launch Backend (Terminal 1)
```bash
cd server
npm install
npm run dev
# Confirm: "MongoDB connected: mongodb://127.0.0.1:27017/mindscribe"
# Confirm: "Running on: http://localhost:3000"
```

### 3. Launch Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
# Confirm: "VITE v8.0.11 ready in 1378 ms"
# Confirm: "➜ Local: http://localhost:5173/"
```

Open **[http://localhost:5173/](http://localhost:5173/)** in your browser to start.

---

## 🔍 6. Quality Assurance & Troubleshooting

### Common CommonJS Import Crashes (Node ESM)
* **Problem**: `SyntaxError: The requested module 'pdf-parse' does not provide an export named 'default'`
* **Resolution**: Cured inside `upload.service.js` using Node's `createRequire` method to securely resolve default exports:
  ```javascript
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  const pdf = require('pdf-parse');
  ```

### Heavy Puppeteer Binary Loading Exception
* **Problem**: Server crash due to missing `puppeteer` packages during HTML-to-PDF rendering.
* **Resolution**: Cleaned up the server-side Puppeteer dependency in `export.service.js` since PDF compilation is handled efficiently inside the client browser. This allows the backend server to launch instantly on all standard hosting systems.

---

## ⭐ 7. Success Validation Story
To verify system compliance, complete the following user journey:
1. Load **`http://localhost:5173`**. Check that a premium space sky stars backdrop floats around a rotating cyan orb.
2. Click **"+ New Project"** in the sidebar. Note that an "Untitled Project" is saved automatically to your MongoDB database.
3. Import a sample PDF or TXT file using the **"Import"** button. The parsed text should render inside the rich editor.
4. Note the save status in the header changing between `● Unsaved changes`, `Syncing...`, and `Auto-saved`.
5. Click **"AI Synthesize"**. Watch the loading spinner. The text should render formatted study guides.
6. Switch to the **"Visuals"** tab and interact with the D3 concept graph, Chart.js keywords, and Mermaid charts.
7. Click the **"Play"** button on the Notes Narrator in the header. The narrator will read your notes aloud in high fidelity.
8. Click **"Export PDF"** to verify that your document exports cleanly as a formatted PDF page.
