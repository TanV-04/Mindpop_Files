// apiService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      console.log("Your session has expired. Please log in again.");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

// Local Storage Helper
const localStorageService = {
  getLocalProgressData: () => {
    try {
      const storedData = localStorage.getItem("typingProgress");
      return storedData ? JSON.parse(storedData) : { timeSeriesData: [] };
    } catch (error) {
      console.error("Error reading from local storage:", error);
      return { timeSeriesData: [] };
    }
  },

  saveLocalProgressData: (data) => {
    try {
      localStorage.setItem("typingProgress", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Error writing to local storage:", error);
      throw error;
    }
  },
};

// Authentication Services
export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      if (response.data.user?.age) {
        localStorage.setItem("userAge", response.data.user.age);
      }
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userAge");
      localStorage.removeItem("userAgeGroup");
    }
  },

  logoutAll: async () => {
    try {
      await api.post("/auth/logout-all");
    } finally {
      localStorage.removeItem("token");
    }
  },
};

// User Services
export const userService = {
  getCurrentUser: async () => {
    try {
      const response = await api.get("/users/me");
      console.group("User Profile Request");
      console.log("Full Response:", response);
      console.log("Response Data:", response.data);
      console.log("Response Status:", response.status);
      console.groupEnd();
      return response.data;
    } catch (error) {
      console.error("Get Current User Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  updateProfile: async (formData) => {
    const response = await api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await api.put("/users/password", passwordData);
    return response.data;
  },

  updatePrivacySettings: async (privacySettings) => {
    const response = await api.put("/users/privacy", privacySettings);
    return response.data;
  },
};

// Progress Services
// Progress Services
export const progressService = {
  getProgressData: async (gameType = "all", timeFrame = "month") => {
    try {
      const response = await api.get("/progress", {
        params: { game: gameType, timeFrame },
      });

      // Only return data if we have real sessions
      if (response.data && response.data.totalSessions > 0) {
        return response.data;
      } else {
        // Return empty data structure when no real data exists
        return {
          timeSeriesData: [],
          gameDistribution: {
            seguin: 0,
            monkey: 0,
            jigsaw: 0,
          },
          averageCompletionTimes: {},
          improvementMetrics: {},
          totalSessions: 0,
          benchmarks: {
            seguin: { standardTime: 80 },
            monkey: { standardTime: 120 },
            jigsaw: { standardTime: 300 },
          },
          cognitiveSkills: [],
        };
      }
    } catch (error) {
      console.warn("Failed to fetch progress from API:", error);

      // Return empty data instead of falling back to potentially fake local storage data
      return {
        timeSeriesData: [],
        gameDistribution: {
          seguin: 0,
          monkey: 0,
          jigsaw: 0,
        },
        averageCompletionTimes: {},
        improvementMetrics: {},
        totalSessions: 0,
        benchmarks: {
          seguin: { standardTime: 80 },
          monkey: { standardTime: 120 },
          jigsaw: { standardTime: 300 },
        },
        cognitiveSkills: [],
      };
    }
  },

  saveGameProgress: async (progressData) => {
    try {
      if (!progressData.date) {
        progressData.date = new Date().toISOString();
      }

      // Normalize progress data for different games
      if (progressData.gameType === "monkey") {
        if (!progressData.wpm && progressData.completionTime) {
          progressData.wpm = progressData.completionTime;
        }
        if (!progressData.monkeyAccuracy) {
          progressData.monkeyAccuracy = progressData.accuracy;
        }
      }

      const token = localStorage.getItem("token");

      if (token) {
        try {
          console.log("Saving progress to API:", progressData);
          const response = await api.post("/progress", progressData);
          console.log("Progress saved successfully:", response.data);
          return response.data;
        } catch (apiError) {
          console.warn(
            "Failed to save progress to API, saving locally instead:",
            apiError
          );
          // Don't save locally - only use API data to avoid duplicates
          throw new Error(
            "Failed to save progress. Please check your connection."
          );
        }
      } else {
        console.log("No authentication token, cannot save progress");
        throw new Error("Please log in to save your progress.");
      }
    } catch (error) {
      console.error("Error saving game progress:", error);
      throw error;
    }
  },

  getGameStatistics: async (gameType) => {
    try {
      const response = await api.get(`/progress/stats/${gameType}`);

      // Only return if we have real data
      if (response.data && response.data.totalSessions > 0) {
        return response.data;
      } else {
        return {
          message: "No progress data found for this game",
          data: {
            bestTime: null,
            averageTime: null,
            totalSessions: 0,
            weeklyProgress: [],
          },
        };
      }
    } catch (error) {
      console.warn("Failed to fetch game statistics from API:", error);

      // Return empty statistics instead of fake data
      return {
        message: "No data available",
        data: {
          bestTime: null,
          averageTime: null,
          totalSessions: 0,
          weeklyProgress: [],
        },
      };
    }
  },
};

// Support Services
export const supportService = {
  createTicket: async (ticketData) => {
    const response = await api.post("/support/ticket", ticketData);
    return response.data;
  },

  getTickets: async () => {
    const response = await api.get("/support/tickets");
    return response.data;
  },

  getTicketById: async (ticketId) => {
    const response = await api.get(`/support/ticket/${ticketId}`);
    return response.data;
  },

  respondToTicket: async (ticketId, message) => {
    const response = await api.post(`/support/ticket/${ticketId}/respond`, {
      message,
    });
    return response.data;
  },
};

// Analysis Services
export const analysisService = {
  saveAnalysisResults: async (analysisData) => {
    try {
      const response = await api.post("/analysis/save", analysisData);
      return response.data;
    } catch (error) {
      console.error("Error saving analysis results:", error);
      throw error;
    }
  },

  getAnalysisHistory: async () => {
    try {
      const response = await api.get("/analysis/history");
      return response.data;
    } catch (error) {
      console.error("Error fetching analysis history:", error);
      throw error;
    }
  },

  getAnalysisById: async (analysisId) => {
    try {
      const response = await api.get(`/analysis/${analysisId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching analysis:", error);
      throw error;
    }
  },
};
