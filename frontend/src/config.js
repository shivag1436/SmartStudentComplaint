/**
 * API Configuration
 * File: src/config.js
 */

// API Base URL - can be changed via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,

  // Complaints
  COMPLAINTS: `${API_BASE_URL}/api/complaints`,
  COMPLAINT_STATUS: `${API_BASE_URL}/api/complaints/status`,

  // Statistics
  STATS: `${API_BASE_URL}/api/stats`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,

  // Health
  HEALTH: `${API_BASE_URL}/api/health`,
}

export default API_BASE_URL
