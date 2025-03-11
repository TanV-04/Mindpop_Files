import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';


// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Optionally clear token and redirect to login
      // localStorage.removeItem('token');
      // window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const authService = {
  register: async (userData) => {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },
  
  logoutAll: async () => {
    try {
      await api.post('/auth/logout-all');
    } finally {
      localStorage.removeItem('token');
    }
  }
};

// User Services
export const userService = {
    getCurrentUser: async () => {
        try {
          const response = await api.get('/users/me');
          console.group('User Profile Request');
          console.log('Full Response:', response);
          console.log('Response Data:', response.data);
          console.log('Response Status:', response.status);
          console.groupEnd();
          
          // Return the appropriate data structure
          return response.data;
        } catch (error) {
          console.error('Get Current User Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          throw error;
        }
      },
  
      updateProfile: async (formData) => {
        const response = await api.put('/users/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      },
  
  updatePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },
  
  updatePrivacySettings: async (privacySettings) => {
    const response = await api.put('/users/privacy', privacySettings);
    return response.data;
  }
};

// Progress Services
export const progressService = {
  getProgressData: async (gameType = 'all', timeFrame = 'month') => {
    const response = await api.get('/progress', { 
      params: { game: gameType, timeFrame } 
    });
    return response.data;
  },
  
  saveGameProgress: async (progressData) => {
    const response = await api.post('/progress', progressData);
    return response.data;
  },
  
  getGameStatistics: async (gameType) => {
    const response = await api.get(`/progress/stats/${gameType}`);
    return response.data;
  }
};

// Support Services
export const supportService = {
  createTicket: async (ticketData) => {
    const response = await api.post('/support/ticket', ticketData);
    return response.data;
  },
  
  getTickets: async () => {
    const response = await api.get('/support/tickets');
    return response.data;
  },
  
  getTicketById: async (ticketId) => {
    const response = await api.get(`/support/ticket/${ticketId}`);
    return response.data;
  },
  
  respondToTicket: async (ticketId, message) => {
    const response = await api.post(`/support/ticket/${ticketId}/respond`, { message });
    return response.data;
  }
};