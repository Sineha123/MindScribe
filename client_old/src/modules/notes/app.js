import { requestAnswer, requestExplanation, requestSummary } from "./api/ai.api.js";
import { processText } from "./api/notes.api.js";
import { deleteProject, getProjects, saveProject } from "./api/projects.api.js";
import { renderKeywordCharts } from "./charts/keywordChart.js";
import { renderFlowchart } from "./flow/flowchart.js";
import { renderConceptGraph } from "./graph/conceptGraph.js";
import { renderNotes } from "./ui/renderNotes.js";
import { renderProjects } from "./ui/renderProjects.js";
import { pauseSpeech, resumeSpeech, speakNotes, stopSpeech } from "./voice/speech.js";

const textarea = document.getElementById("note-input");
const generateBtn = document.getElementById("generate-btn");
const saveBtn = document.getElementById("save-btn");
const clearBtn = document.getElementById("clear-btn");
const aiSummaryBtn = document.getElementById("ai-summary-btn");
const aiExplainBtn = document.getElementById("ai-explain-btn");
const aiAskBtn = document.getElementById("ai-ask-btn");
const aiQuestionInput = document.getElementById("ai-question-input");
const aiOutput = document.getElementById("ai-output");
const readBtn = document.getElementById("read-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const stopBtn = document.getElementById("stop-btn");
const statusMessage = document.getElementById("status-message");
const notesOutput = document.getElementById("notes-output");
const projectsList = document.getElementById("projects-list");

let currentProjectData = null;
let currentNotes = [];
let currentKeywords = {};
let currentSentences = [];
let aiRequestInFlight = false;

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

function setLoadingState(isLoading, message = "Processing...") {
  generateBtn.disabled = isLoading;
  saveBtn.disabled = isLoading || !currentProjectData;
  clearBtn.disabled = isLoading;
  readBtn.disabled = isLoading || currentNotes.length === 0;
  pauseBtn.disabled = isLoading || currentNotes.length === 0;
  resumeBtn.disabled = isLoading || currentNotes.length === 0;
  stopBtn.disabled = isLoading || currentNotes.length === 0;

  if (isLoading) {
    setStatus(message, "info");
  }
}

function getCurrentContent() {
  if (currentProjectData?.text?.trim()) {
    return currentProjectData.text.trim();
  }

  return textarea.value.trim();
}

function setAiLoadingState(isLoading, message = "Thinking...") {
  aiRequestInFlight = isLoading;
  aiSummaryBtn.disabled = isLoading;
  aiExplainBtn.disabled = isLoading;
  aiAskBtn.disabled = isLoading;
  aiQuestionInput.disabled = isLoading;

  if (isLoading) {
    aiOutput.textContent = message;
  }
}

function syncVoiceButtons() {
  const hasNotes = currentNotes.length > 0;
  readBtn.disabled = !hasNotes;
  pauseBtn.disabled = !hasNotes;
  resumeBtn.disabled = !hasNotes;
  stopBtn.disabled = !hasNotes;
}

function highlightCurrentNote(index) {
  renderNotes(currentNotes, index);
}

function resetNotesView() {
  stopSpeech();
  notesOutput.innerHTML = "";
  currentProjectData = null;
  currentNotes = [];
  currentKeywords = {};
  currentSentences = [];
  saveBtn.disabled = true;
  syncVoiceButtons();
  renderKeywordCharts({});
  renderConceptGraph({ keywords: {}, sentences: [] });
  aiOutput.textContent = "AI answers will appear here.";
}

function fillEditorFromProject(project) {
  textarea.value = project.text || "";
  currentProjectData = {
    text: project.text || "",
    notes: Array.isArray(project.notes) ? project.notes : [],
    keywords: project.keywords || {},
    summary: Array.isArray(project.summary) ? project.summary : []
  };

  currentNotes = [...currentProjectData.notes];
  currentKeywords = { ...currentProjectData.keywords };
  currentSentences = Array.isArray(project.sentences) ? [...project.sentences] : [];
  renderNotes(currentNotes);
  renderKeywordCharts(currentKeywords);
  renderConceptGraph({
    keywords: currentKeywords,
    sentences: currentSentences
  });
  saveBtn.disabled = false;
  syncVoiceButtons();
  setStatus("Project loaded.", "success");
}

async function loadProjects() {
  try {
    const response = await getProjects();

    if (!response.success) {
      throw new Error(response.message || "Could not load saved projects.");
    }

    renderProjects(response.data || []);
  } catch (error) {
    renderProjects([]);
    setStatus(error.message || "Could not load saved projects.", "error");
  }
}

async function handleGenerateNotes() {
  const text = textarea.value.trim();

  if (!text) {
    setStatus("Please enter some text before generating notes.", "error");
    textarea.focus();
    return;
  }

  notesOutput.innerHTML = "";
  setLoadingState(true, "Processing...");

  try {
    const response = await processText(text);

    if (!response.success) {
      throw new Error(response.message || "Could not process text.");
    }

    currentProjectData = {
      text,
      notes: response.data?.notes || [],
      keywords: response.data?.keywords || {},
      summary: response.data?.summary || [],
      sentences: response.data?.sentences || []
    };

    currentNotes = [...currentProjectData.notes];
    currentKeywords = { ...currentProjectData.keywords };
    currentSentences = [...currentProjectData.sentences];
    renderNotes(currentNotes);
    renderKeywordCharts(currentKeywords);
    renderConceptGraph({
      keywords: currentKeywords,
      sentences: currentSentences
    });
    saveBtn.disabled = false;
    syncVoiceButtons();
    setStatus("Notes generated successfully.", "success");
  } catch (error) {
    resetNotesView();
    setStatus(error.message || "Something went wrong while generating notes.", "error");
  } finally {
    setLoadingState(false);
  }
}

async function handleSaveProject() {
  if (!currentProjectData) {
    setStatus("Generate notes before saving a project.", "error");
    return;
  }

  setLoadingState(true, "Saving project...");

  try {
    const response = await saveProject(currentProjectData);

    if (!response.success) {
      throw new Error(response.message || "Could not save project.");
    }

    setStatus("Project saved successfully.", "success");
    await loadProjects();
  } catch (error) {
    setStatus(error.message || "Something went wrong while saving.", "error");
  } finally {
    setLoadingState(false);
  }
}

async function runAiAction(requestFn, payloadBuilder) {
  if (aiRequestInFlight) {
    return;
  }

  const content = getCurrentContent();

  if (!content) {
    setStatus("Add or generate content before using AI tools.", "error");
    return;
  }

  setAiLoadingState(true, "Thinking...");

  try {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 250);
    });

    const response = await requestFn(payloadBuilder(content));

    if (!response.success) {
      throw new Error(response.message || "AI request failed.");
    }

    aiOutput.textContent = response.data;
    setStatus("AI response ready.", "success");
  } catch (error) {
    aiOutput.textContent = "Something went wrong while contacting the AI assistant.";
    setStatus(error.message || "AI request failed.", "error");
  } finally {
    setAiLoadingState(false);
  }
}

function handleProjectClick(event) {
  const projectItem = event.target.closest("[data-project]");

  if (!projectItem || event.target.closest("[data-delete-project]")) {
    return;
  }

  const project = JSON.parse(projectItem.dataset.project);
  fillEditorFromProject(project);
}

async function handleProjectDelete(event) {
  const deleteButton = event.target.closest("[data-delete-project]");

  if (!deleteButton) {
    return;
  }

  event.stopPropagation();

  setLoadingState(true, "Deleting project...");

  try {
    const response = await deleteProject(deleteButton.dataset.deleteProject);

    if (!response.success) {
      throw new Error(response.message || "Could not delete project.");
    }

    if (currentProjectData && deleteButton.dataset.projectText === currentProjectData.text) {
      resetNotesView();
    }

    setStatus("Project deleted successfully.", "success");
    await loadProjects();
  } catch (error) {
    setStatus(error.message || "Something went wrong while deleting.", "error");
  } finally {
    setLoadingState(false);
  }
}

generateBtn.addEventListener("click", handleGenerateNotes);
saveBtn.addEventListener("click", handleSaveProject);
aiSummaryBtn.addEventListener("click", () => {
  runAiAction(
    ({ content }) => requestSummary(content),
    (content) => ({ content })
  );
});
aiExplainBtn.addEventListener("click", () => {
  runAiAction(
    ({ content }) => requestExplanation(content),
    (content) => ({ content })
  );
});
aiAskBtn.addEventListener("click", () => {
  const question = aiQuestionInput.value.trim();

  if (!question) {
    setStatus("Enter a question before asking the AI assistant.", "error");
    aiQuestionInput.focus();
    return;
  }

  runAiAction(
    ({ content, currentQuestion }) => requestAnswer(content, currentQuestion),
    (content) => ({ content, currentQuestion: question })
  );
});
readBtn.addEventListener("click", () => {
  if (currentNotes.length === 0) {
    setStatus("Generate or load notes before using voice reading.", "error");
    return;
  }

  speakNotes(currentNotes, highlightCurrentNote);
  setStatus("Reading notes aloud.", "info");
});
pauseBtn.addEventListener("click", () => {
  pauseSpeech();
  setStatus("Speech paused.", "info");
});
resumeBtn.addEventListener("click", () => {
  resumeSpeech();
  setStatus("Speech resumed.", "info");
});
stopBtn.addEventListener("click", () => {
  stopSpeech();
  renderNotes(currentNotes);
  setStatus("Speech stopped.", "info");
});

clearBtn.addEventListener("click", () => {
  textarea.value = "";
  resetNotesView();
  clearStatus();
  renderProjects([]);
  loadProjects();
});

projectsList.addEventListener("click", handleProjectClick);
projectsList.addEventListener("click", handleProjectDelete);

renderNotes([]);
renderKeywordCharts({});
renderConceptGraph({ keywords: {}, sentences: [] });
syncVoiceButtons();
loadProjects();

window.addEventListener("load", () => {
  renderFlowchart();
});
