// ================================================================
//  app.js — MindScribe Notes Module (Frontend)
//
//  WHAT THIS FILE DOES:
//    1. Listens for the "Generate Notes" button click
//    2. Sends the user's text to the backend via fetch()
//    3. Receives the processed data (notes, keywords, summary, sentences)
//    4. Renders each section into its own tab panel
//
//  DATA FLOW:
//    User types text
//        ↓
//    fetch("http://localhost:3000/api/notes/process-text", POST)
//        ↓
//    Express receives → notes.service → core engine runs
//        ↓
//    Response: { success, data: { notes, keywords, sentences, summary } }
//        ↓
//    We render it into 4 tab panels
// ================================================================

// ── API CONFIG ───────────────────────────────────────────────────
// Centralise the backend URL so it's easy to change later
const API_URL = "http://localhost:3000/api/notes/process-text";

// ── DOM REFERENCES ───────────────────────────────────────────────
const textarea      = document.getElementById("note-input");
const generateBtn   = document.getElementById("generate-btn");
const clearBtn      = document.getElementById("clear-btn");
const charCount     = document.getElementById("char-count");
const statusBanner  = document.getElementById("status-banner");
const resultsCard   = document.getElementById("results-card");

// Panels (tab content areas)
const panels = {
  notes:     document.getElementById("panel-notes"),
  summary:   document.getElementById("panel-summary"),
  keywords:  document.getElementById("panel-keywords"),
  sentences: document.getElementById("panel-sentences"),
};

// Tabs (the buttons at the top of results)
const tabs = document.querySelectorAll(".tab");

// ── CHARACTER COUNTER ────────────────────────────────────────────
// Updates the small counter below the textarea as the user types.
textarea.addEventListener("input", () => {
  const n = textarea.value.length;
  charCount.textContent = `${n.toLocaleString()} character${n !== 1 ? "s" : ""}`;
});

// ── TAB SWITCHING ────────────────────────────────────────────────
// When the user clicks a tab, show its panel and hide others.
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // Deactivate all tabs + hide all panels
    tabs.forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    Object.values(panels).forEach(p => {
      p.classList.remove("active");
      p.classList.add("hidden");
    });

    // Activate clicked tab + matching panel
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const panelId = `panel-${tab.dataset.tab}`;
    const panel   = document.getElementById(panelId);
    panel.classList.remove("hidden");
    panel.classList.add("active");
  });
});

// ── STATUS HELPERS ───────────────────────────────────────────────
function showStatus(message, type = "info") {
  statusBanner.textContent = message;
  statusBanner.className   = `status-banner ${type}`;
  statusBanner.classList.remove("hidden");
}
function hideStatus() {
  statusBanner.classList.add("hidden");
}

// ── RENDER HELPERS ───────────────────────────────────────────────
// Each function receives its slice of data and populates its panel.

/**
 * renderNotes — numbered note bullets from the core engine
 * @param {string[]} notes
 */
function renderNotes(notes) {
  if (!notes || notes.length === 0) {
    panels.notes.innerHTML = '<p class="empty-state">No notes generated.</p>';
    return;
  }
  panels.notes.innerHTML = notes.map((note, i) => `
    <div class="note-item">
      <span class="note-index">${i + 1}</span>
      <span>${note}</span>
    </div>`).join("");
}

/**
 * renderSummary — key sentences scored highest by the engine
 * @param {string[]} summary
 */
function renderSummary(summary) {
  if (!summary || summary.length === 0) {
    panels.summary.innerHTML = '<p class="empty-state">No summary available.</p>';
    return;
  }
  panels.summary.innerHTML = summary.map(s => `
    <div class="summary-item">${s}</div>`).join("");
}

/**
 * renderKeywords — keyword → score pairs as chips
 * @param {Object.<string,number>} keywords
 */
function renderKeywords(keywords) {
  const entries = Object.entries(keywords || {});
  if (entries.length === 0) {
    panels.keywords.innerHTML = '<p class="empty-state">No keywords detected.</p>';
    return;
  }
  panels.keywords.innerHTML = `<div class="keyword-grid">
    ${entries.map(([word, score]) => `
      <span class="keyword-chip">
        ${word} <span class="keyword-score">${score}</span>
      </span>`).join("")}
  </div>`;
}

/**
 * renderSentences — all cleaned sentences from the tokenizer
 * @param {string[]} sentences
 */
function renderSentences(sentences) {
  if (!sentences || sentences.length === 0) {
    panels.sentences.innerHTML = '<p class="empty-state">No sentences found.</p>';
    return;
  }
  panels.sentences.innerHTML = sentences.map(s => `
    <div class="sentence-item">${s}</div>`).join("");
}

// ── RESET TABS ───────────────────────────────────────────────────
// Always go back to the "Notes" tab when new results arrive
function resetToFirstTab() {
  tabs.forEach(t => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  Object.values(panels).forEach(p => {
    p.classList.remove("active");
    p.classList.add("hidden");
  });
  tabs[0].classList.add("active");
  tabs[0].setAttribute("aria-selected", "true");
  panels.notes.classList.remove("hidden");
  panels.notes.classList.add("active");
}

// ── MAIN HANDLER ─────────────────────────────────────────────────
generateBtn.addEventListener("click", async () => {
  const text = textarea.value.trim();

  // Guard — don't send an empty request
  if (!text) {
    showStatus("⚠️ Please enter some text first.", "error");
    textarea.focus();
    return;
  }

  // ── Loading state ──
  generateBtn.disabled = true;
  showStatus("✨ Processing your text…", "info");
  resultsCard.classList.add("hidden");

  try {
    // ── Fetch ──────────────────────────────────────────────
    // fetch() sends an HTTP request.
    // method: "POST"              → we are SENDING data, not just reading
    // headers Content-Type       → tells Express "this body is JSON"
    // body: JSON.stringify(...)   → converts the JS object into a JSON string
    const response = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ text }),
    });

    // ── Parse response ─────────────────────────────────────
    // res.json() reads the response body and parses it from JSON → JS object
    const payload = await response.json();

    // If the server returned success: false, throw so the catch block handles it
    if (!payload.success) {
      throw new Error(payload.message || "Server returned an error.");
    }

    // ── Destructure the four data sections ─────────────────
    const { notes, keywords, sentences, summary } = payload.data;

    // ── Render into panels ─────────────────────────────────
    resetToFirstTab();
    renderNotes(notes);
    renderSummary(summary);
    renderKeywords(keywords);
    renderSentences(sentences);

    // Show results card with slide-up animation
    resultsCard.classList.remove("hidden");

    // Update status
    const noteCount = notes?.length ?? 0;
    showStatus(`✅ Done! Generated ${noteCount} note${noteCount !== 1 ? "s" : ""} from your text.`, "success");

  } catch (error) {
    // Network failure or server error
    showStatus(
      error.message.includes("Failed to fetch")
        ? "❌ Cannot reach the server. Make sure it's running on port 3000."
        : `❌ ${error.message}`,
      "error"
    );
  } finally {
    // Always re-enable the button
    generateBtn.disabled = false;
  }
});

// ── CLEAR HANDLER ────────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  textarea.value = "";
  charCount.textContent = "0 characters";
  resultsCard.classList.add("hidden");
  hideStatus();
  textarea.focus();
});
