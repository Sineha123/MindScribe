import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// ─── Request Interceptor ───────────────────────────────────────────────────
// Attaches Gemini API key and LLM provider settings from localStorage
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('geminiApiKey');
  const provider = localStorage.getItem('llmProvider') || 'gemini';
  const ollamaModel = localStorage.getItem('ollamaModel') || 'llama3.2';

  if (apiKey) config.headers['x-gemini-api-key'] = apiKey;
  config.headers['x-llm-provider'] = provider;
  config.headers['x-ollama-model'] = ollamaModel;

  return config;
});

// ─── Response Interceptor ──────────────────────────────────────────────────
// Handles Gemini auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if ((status === 401 || status === 400) && data?.message?.includes('API_KEY')) {
        window.dispatchEvent(new CustomEvent('gemini-api-error'));
      }
    }
    return Promise.reject(error);
  }
);

// ─── Service Definitions ───────────────────────────────────────────────────

export const notesService = {
  processText: (text) => api.post('/notes/process-text', { text }),
  generateSmartNotes: (text, language = 'English', opts = {}) =>
    api.post('/ai/notes', { text, language, ...opts }),
};

export const aiService = {
  generateSummary: (text, type = 'concise', language = 'English', opts = {}) =>
    api.post('/ai/summary', { text, type, language, ...opts }),
  askQuestion: (content, question, language = 'English', projectId, opts = {}) =>
    api.post('/ai/ask', { content, question, language, projectId, ...opts }),
  explainContent: (content, level = 'beginner', language = 'English', opts = {}) =>
    api.post('/ai/explain', { content, level, language, ...opts }),
  generateVisuals: (text, language = 'English', opts = {}, customPrompt = '') =>
    api.post('/ai/visuals', { text, language, customPrompt, ...opts }),
  getProviders: () => api.get('/ai/providers'),
  getContext: (text, question, language, projectId, documentTitle) =>
    api.post('/ai/context', { text, question, language, projectId, documentTitle }),
};

export const uploadService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const exportService = {
  exportDocx: (title, content) => api.post('/export/docx', { title, content }, { responseType: 'blob' }),
  exportPdf: (title, content) => api.post('/export/pdf', { title, content }, { responseType: 'blob' }),
};

export const projectsService = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  saveProject: (data) => data._id ? api.put(`/projects/${data._id}`, data) : api.post('/projects', data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

export default api;
