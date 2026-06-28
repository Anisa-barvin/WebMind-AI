import axios from 'axios';

// Backend base URL
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT Authorization token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me')
};

export const websiteAPI = {
  train: (url, name) => api.post('/websites/train', { url, name }),
  getStatus: (id) => api.get(`/websites/status/${id}`),
  list: () => api.get('/websites'),
  retrain: (id) => api.post(`/websites/retrain/${id}`),
  delete: (id) => api.delete(`/websites/${id}`)
};

export const chatAPI = {
  createConversation: (websiteId, title) => api.post('/chat/conversations', { websiteId, title }),
  listConversations: (websiteId) => api.get(`/chat/conversations/${websiteId}`),
  getHistory: (conversationId) => api.get(`/chat/history/${conversationId}`),
  sendMessage: (conversationId, text) => api.post('/chat/message', { conversationId, text }),
  // Returns the streaming URL for EventSource setup in Chat interface
  getStreamUrl: (conversationId, text) => {
    const token = localStorage.getItem('token');
    return `http://localhost:5000/api/chat/stream?conversationId=${conversationId}&text=${encodeURIComponent(text)}&token=${token}`;
  }
};

export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics')
};

export const documentationAPI = {
  getDocumentation: (websiteId) => api.get(`/documentation/${websiteId}`),
  
  // Helper to construct URLs for downloads that include auth token
  getExportUrl: (websiteId, format) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/documentation/export/${websiteId}/${format}?token=${token}`;
  },
  
  getChatExportUrl: (conversationId, format) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/documentation/export-chat/${conversationId}/${format}?token=${token}`;
  },

  getReportExportUrl: (websiteId) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/documentation/export-report/${websiteId}?token=${token}`;
  },
  
  // Alternative: fetch as blob for programmatic download
  downloadBlob: async (url) => {
    const response = await api.get(url.replace(API_URL, ''), { responseType: 'blob' });
    return response.data;
  }
};

export default api;
