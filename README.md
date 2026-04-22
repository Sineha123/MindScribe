# 🧠 MindScribe — AI Learning & Knowledge Visualization System

MindScribe is a full-stack AI-powered learning platform that transforms raw text into structured knowledge, visual insights, and intelligent explanations.

It combines:

* 🧠 Core text processing engine
* 🌐 Backend API system
* 💾 Database persistence
* 🔊 Voice narration
* 📊 Data visualization
* 🤖 AI-powered understanding

---

# 🚀 Features

## 📌 Core Features

* Convert raw text → structured notes
* Keyword extraction & summarization
* Modular processing engine

## 🔊 Voice System

* Read notes aloud
* Highlight current sentence
* Pause / Resume / Stop

## 📊 Visualization

* Keyword frequency charts (bar + pie)
* Flowchart (system architecture)
* Concept graph (knowledge relationships)

## 💾 Project System

* Save notes as projects
* Load previous work
* Delete & manage projects

## 🤖 AI Layer

* Smart AI summary
* Q&A from notes
* Beginner-friendly explanations

---

# 🧱 Tech Stack

## Frontend

* Vanilla JavaScript
* HTML + CSS

## Backend

* Node.js
* Express.js

## Database

* MongoDB + Mongoose

## Visualization

* Chart.js
* Mermaid.js
* D3.js

## AI

* Google Gemini API

---

# 🧠 System Architecture

```text
User Input
   ↓
Frontend (UI)
   ↓
Fetch API
   ↓
Backend (Express Server)
   ↓
Core Engine (Text Processing)
   ↓
AI Layer (Gemini)
   ↓
Database (MongoDB)
   ↓
Response → Frontend
```

---

# 🔁 Processing Flow

```text
Text Input
   ↓
Cleaning
   ↓
Tokenization
   ↓
Keyword Extraction
   ↓
Summary Generation
   ↓
Notes Builder
   ↓
AI Enhancement
   ↓
Visualization + Output
```

---

# 🧩 Folder Structure

```bash
MindScribe/
│
├── core/                  # Text processing engine
│
├── server/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── notes/
│   │   │   ├── projects/
│   │   │   ├── ai/
│   │   │
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config/
│   │   ├── middlewares/
│   │   │
│   │   ├── app.js
│   │   └── server.js
│
├── client/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── notes/
│   │   │   │   ├── api/
│   │   │   │   ├── ui/
│   │   │   │   ├── charts/
│   │   │   │   ├── flow/
│   │   │   │   ├── graph/
│   │   │   │   ├── voice/
│   │
│   │   ├── index.html
│   │   ├── app.js
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone Project

```bash
git clone <your-repo-url>
cd MindScribe
```

---

## 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

Run server:

```bash
node src/server.js
```

---

## 3️⃣ Frontend

Open:

```bash
client/src/modules/notes/index.html
```

---

# 🔌 API Endpoints

## Notes

```
POST /api/notes/process-text
```

## Projects

```
POST   /api/projects/save
GET    /api/projects
GET    /api/projects/:id
DELETE /api/projects/:id
```

## AI

```
POST /api/ai/summary
POST /api/ai/ask
POST /api/ai/explain
```

---

# 📊 Visualization Layer

## Charts

* Keyword frequency
* Distribution

## Flowchart

* System architecture
* Processing pipeline

## Concept Graph

* Relationships between ideas
* Knowledge mapping

---

# 🧠 AI Capabilities

* Intelligent summarization
* Context-based answering
* Simplified explanations
* Learning assistance

---

# 🔐 Security

* API keys stored in `.env`
* No sensitive data in frontend

---

# ⚠️ Limitations

* Free AI API has rate limits
* Concept graph is basic (can be improved)
* UI currently uses Vanilla JS (React upgrade planned)

---

# 🚀 Future Improvements

* React migration
* Chat interface
* PDF export
* Advanced AI reasoning
* Better graph intelligence

---

# 💎 Project Vision

MindScribe is not just a notes app.

It is a:

> 🧠 Knowledge Processing + Visualization + AI Learning System

---

# 👨‍💻 Author

Built as a deep learning project to understand:

* Full-stack development
* System design
* AI integration
* Visualization

---

# ⭐ Final Note

This project demonstrates real-world concepts:

* Modular architecture
* Data processing
* API design
* AI integration

---

🔥 This is a portfolio-level system, not a beginner project.
