import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('esl_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('esl_token');
        localStorage.removeItem('esl_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data: { email: string; password: string; name: string; level?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (data: { name?: string; level?: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

export const scenarioService = {
  getAll: async (params?: { level?: string; category?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/scenarios', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/scenarios/${id}`);
    return response.data;
  },
  getRecommended: async (limit?: number) => {
    const response = await api.get('/scenarios/recommended', { params: { limit } });
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/scenarios/categories');
    return response.data;
  },
  getLevels: async () => {
    const response = await api.get('/scenarios/levels');
    return response.data;
  },
};

export const conversationService = {
  start: async (scenarioId: string) => {
    const response = await api.post('/conversations', { scenarioId });
    return response.data;
  },
  sendMessage: async (id: string, content: string, transcription?: string, expectedTranscript?: string) => {
    const response = await api.post(`/conversations/${id}/messages`, {
      content,
      transcription,
      expectedTranscript,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },
  list: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/conversations', { params });
    return response.data;
  },
  complete: async (id: string, score: number) => {
    const response = await api.post(`/conversations/${id}/complete`, { score });
    return response.data;
  },
  flagForReview: async (id: string, messageId?: string, reason?: string) => {
    const response = await api.post(`/conversations/${id}/flag`, { messageId, reason });
    return response.data;
  },
};

export const speechService = {
  analyze: async (data: {
    conversationId: string;
    messageId: string;
    transcription: string;
    expectedTranscript: string;
    audioUrl?: string;
  }) => {
    const response = await api.post('/speech/analyze', data);
    return response.data;
  },
  getHistory: async (limit?: number) => {
    const response = await api.get('/speech/history', { params: { limit } });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/speech/stats');
    return response.data;
  },
};

export const reviewService = {
  getPending: async () => {
    const response = await api.get('/reviews/pending');
    return response.data;
  },
  claimReview: async (id: string) => {
    const response = await api.post(`/reviews/${id}/claim`);
    return response.data;
  },
  submitReview: async (id: string, data: {
    reviews: any[];
    overallFeedback: string;
    recommendedLevel: string;
    recommendedScenarios: string[];
  }) => {
    const response = await api.post(`/reviews/${id}`, data);
    return response.data;
  },
  getHistory: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/reviews/history', { params });
    return response.data;
  },
  getStudentReviews: async () => {
    const response = await api.get('/reviews/student');
    return response.data;
  },
};

export const progressService = {
  getProgress: async () => {
    const response = await api.get('/progress');
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/progress/dashboard');
    return response.data;
  },
  getScenarioProgress: async (scenarioId: string) => {
    const response = await api.get(`/progress/${scenarioId}`);
    return response.data;
  },
  submitAssessment: async (score: number, level?: string) => {
    const response = await api.post('/progress/assess', { score, level });
    return response.data;
  },
};