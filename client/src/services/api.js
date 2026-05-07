import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const notesService = {
  processText: (text) => api.post('/notes/process-text', { text }),
};

export const aiService = {
  generateSummary: (text) => api.post('/ai/summary', { text }),
  askQuestion: (content, question) => api.post('/ai/ask', { content, question }),
  explainContent: (content) => api.post('/ai/explain', { content }),
};

export const projectsService = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  saveProject: (data) => api.post('/projects', data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

export default api;
