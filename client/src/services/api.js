import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const notesService = {
  processText: (text) => api.post('/notes/process-text', { text }),
  generateSmartNotes: (text) => api.post('/ai/notes', { text }),
};

export const aiService = {
  generateSummary: (text, type = 'concise') => api.post('/ai/summary', { text, type }),
  askQuestion: (content, question) => api.post('/ai/ask', { content, question }),
  explainContent: (content, level = 'beginner') => api.post('/ai/explain', { content, level }),
  generateVisuals: (text) => api.post('/ai/visuals', { text }),
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
