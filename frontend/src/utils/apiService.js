// frontend/src/utils/apiService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// ─── Axios Instance ───────────────────────────────────────────────────
const api = axios.create({ baseURL: API_URL });

// ─── Request Interceptor: attach token ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 ────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// ─── Auth Services ────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login',    data),
  logout:   ()     => api.post('/auth/logout'),
};

// ─── User Services ────────────────────────────────────────────────────
export const userService = {
  getCurrentUser:       ()     => api.get('/users/me'),
  updateProfile:        (data) => api.put('/users/profile', data),
  updatePassword:       (data) => api.put('/users/password', data),
  updatePrivacySettings:(data) => api.put('/users/privacy',  data),
};

// ─── Progress Services ────────────────────────────────────────────────
export const progressService = {
  /**
   * Fetch dashboard progress data for the logged-in child.
   * @param {string} game       - 'all' | 'seguin' | 'monkey' | 'jigsaw' | 'balloon'
   * @param {string} timeFrame  - 'week' | 'month' | 'year'
   */
  getProgressData: (game = 'all', timeFrame = 'month') => {
    return api.get('/progress', { params: { game, timeFrame } });
  },

  /**
   * Save one game session. Must include all required fields for the game type.
   * Common fields: gameType, completionTime
   * Seguin:  accuracy, seguinErrors, seguinMisplacements
   * Monkey:  wpm, accuracy, errors, charactersTyped
   * Jigsaw:  ageGroup, puzzleSize, totalPieces, hintsUsed
   * Balloon: ageGroup, balloonsPopped, balloonsMissed, maxCombo, finalScore,
   *          difficultyReached, sessionAccuracy
   */
  saveGameProgress: (data) => api.post('/progress', data),

  /**
   * Detailed per-game statistics (best/avg, recent sessions).
   * @param {string} gameType - 'seguin' | 'monkey' | 'jigsaw' | 'balloon'
   */
  getGameStatistics: (gameType) => api.get(`/progress/stats/${gameType}`),
};

// ─── Support Services ─────────────────────────────────────────────────
export const supportService = {
  createTicket:  (data)     => api.post('/support/ticket',                data),
  getTickets:    ()         => api.get('/support/tickets'),
  getTicket:     (id)       => api.get(`/support/ticket/${id}`),
  respondTicket: (id, data) => api.post(`/support/ticket/${id}/respond`,  data),
};

// ─── Admin Services ───────────────────────────────────────────────────
export const adminService = {
  getAllChildren:     ()         => api.get('/progress/admin/all'),
  getChildProgress:  (childId, params) => api.get(`/progress/admin/child/${childId}`, { params }),
};

export default api;
