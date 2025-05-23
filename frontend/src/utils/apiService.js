//apiService.js
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
// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear token
      localStorage.removeItem('token');
      
      // You can add a message to inform the user
      console.log('Your session has expired. Please log in again.');
      
      // Redirect to login page
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// Local storage helper functions
const localStorageService = {
  getLocalProgressData: () => {
    try {
      const storedData = localStorage.getItem('typingProgress');
      return storedData ? JSON.parse(storedData) : { timeSeriesData: [] };
    } catch (error) {
      console.error('Error reading from local storage:', error);
      return { timeSeriesData: [] };
    }
  },
  
  saveLocalProgressData: (data) => {
    try {
      localStorage.setItem('typingProgress', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error writing to local storage:', error);
      throw error;
    }
  }
};

// Authentication Services
export const authService = {
  register: async (userData) => {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    },
  
  // In authService.login:
login: async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    // Store user age if available
    if (response.data.user?.age) {
      localStorage.setItem('userAge', response.data.user.age);
    }
  }
  return response.data;
},
  
  // In authService in apiService.js:
logout: async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('userAge'); // Add this line
    localStorage.removeItem('userAgeGroup'); // Add this line
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
    try {
      // First try to get data from API
      const response = await api.get('/progress', { 
        params: { game: gameType, timeFrame } 
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch progress from API, falling back to local storage:', error);
      
      // Fall back to local storage if API fails
      const storedData = localStorage.getItem('typingProgress');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Filter data based on gameType if needed
        if (gameType !== 'all') {
          // Only return the relevant game data
          const filteredTimeSeriesData = parsedData.timeSeriesData?.filter(entry => 
            (gameType === 'monkey' && (entry.wpm || entry.monkey)) || 
            (gameType === 'seguin' && entry.seguin)
          );
          
          return {
            ...parsedData,
            timeSeriesData: filteredTimeSeriesData || []
          };
        }
        
        return parsedData;
      }
      
      // Return empty data structure if nothing in local storage
      return {
        timeSeriesData: [],
        totalSessions: 0,
        benchmarks: {
          monkey: { targetWpm: 40 }
        }
      };
    }
  },
  
  saveGameProgress: async (progressData) => {
    try {
      // First, ensure the progressData has a date
      if (!progressData.date) {
        progressData.date = new Date().toISOString();
      }
      
      // If it's a Monkey Type game, ensure it has the necessary fields
      if (progressData.gameType === 'monkey') {
        // Make sure we have wpm field 
        if (!progressData.wpm && progressData.completionTime) {
          progressData.wpm = progressData.completionTime;
        }
        
        // Make sure we have monkeyAccuracy field
        if (!progressData.monkeyAccuracy) {
          progressData.monkeyAccuracy = progressData.accuracy;
        }
      }
      
      // Check if the user is authenticated before attempting API call
      const token = localStorage.getItem('token');
      
      if (token) {
        // User is authenticated, try API first
        try {
          // Add this to your saveGameProgress function, just before calling api.post:

          console.log('Attempting to save progress to API with URL:', `${API_URL}/progress`);
          console.log('Progress data being sent:', progressData);
          console.log('Token exists:', !!token);

          const response = await api.post('/progress', progressData);
          console.log('Progress saved to API successfully:', response.data);
          return response.data;
        } catch (apiError) {
          console.warn('Failed to save progress to API, falling back to local storage:', apiError);
          // Proceed to local storage fallback
        }
      } else {
        console.log('User not authenticated, saving to local storage only');
        // Skip API call attempt if not authenticated
      }
      
      // Local storage fallback (used when API fails or user isn't authenticated)
      const existingData = localStorageService.getLocalProgressData();
      
      // Format the data for storage
      const formattedEntry = {
        date: new Date(progressData.date).toLocaleDateString(),
        gameType: progressData.gameType
      };
      
      // Add game-specific fields
      if (progressData.gameType === 'monkey') {
        formattedEntry.wpm = progressData.wpm || progressData.completionTime;
        formattedEntry.accuracy = progressData.accuracy || progressData.monkeyAccuracy;
        formattedEntry.monkey = progressData.wpm || progressData.completionTime;
        formattedEntry.monkeyAccuracy = progressData.accuracy;
      } else if (progressData.gameType === 'seguin') {
        formattedEntry.time = progressData.completionTime;
        formattedEntry.seguin = progressData.completionTime;
      }
      
      // Extract or initialize the timeSeriesData array
      let timeSeriesData = existingData?.timeSeriesData || [];
      
      // Add the new entry
      timeSeriesData.push(formattedEntry);
      
      // Sort by date (newest entries first)
      timeSeriesData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Keep only the most recent 20 entries to prevent the data from growing too large
      if (timeSeriesData.length > 20) {
        timeSeriesData = timeSeriesData.slice(0, 20);
      }
      
      // Update the progress data structure
      const updatedData = {
        ...existingData,
        timeSeriesData,
        totalSessions: (existingData?.totalSessions || 0) + 1,
        benchmarks: {
          ...existingData?.benchmarks,
          monkey: {
            targetWpm: 40,
            ...(existingData?.benchmarks?.monkey || {})
          }
        }
      };
      
      // Save to local storage
      localStorageService.saveLocalProgressData(updatedData);
      
      return updatedData;
    } catch (error) {
      console.error('Error saving game progress:', error);
      throw error;
    }
  },
  
  getGameStatistics: async (gameType) => {
    try {
      const response = await api.get(`/progress/stats/${gameType}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch game statistics from API:', error);
      
      // Fall back to local data if API fails
      const progressData = localStorageService.getLocalProgressData();
      
      // Extract game-specific statistics
      if (gameType === 'monkey') {
        const monkeyEntries = progressData.timeSeriesData?.filter(entry => entry.wpm || entry.monkey) || [];
        
        if (monkeyEntries.length === 0) {
          return { message: 'No data available' };
        }
        
        // Calculate basic statistics
        const wpms = monkeyEntries.map(entry => entry.wpm || entry.monkey);
        const accuracies = monkeyEntries.map(entry => entry.accuracy || entry.monkeyAccuracy);
        
        return {
          averageWpm: wpms.reduce((sum, wpm) => sum + wpm, 0) / wpms.length,
          averageAccuracy: accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length,
          totalSessions: monkeyEntries.length,
          bestWpm: Math.max(...wpms),
          bestAccuracy: Math.max(...accuracies)
        };
      }
      
      return { message: 'No data available' };
    }
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