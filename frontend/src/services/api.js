/**
 * API Service for Smart Student Complaint System
 * This service handles all communication with the Python FastAPI backend
 * 
 * File: src/services/api.js
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ComplaintSystemAPI {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = this.getToken()
  }

  // ===================== Token Management =====================
  
  saveToken(token) {
    localStorage.setItem('student-auth-token', token)
    this.token = token
  }

  getToken() {
    return localStorage.getItem('student-auth-token')
  }

  clearToken() {
    localStorage.removeItem('student-auth-token')
    this.token = null
  }

  // ===================== HTTP Request Helper =====================
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // ===================== Authentication Endpoints =====================

  /**
   * Sign up a new student
   */
  signUp(firstName, lastName, email, mobileNumber, password) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        mobile_number: mobileNumber,
        password,
      }),
    })
  }

  /**
   * Sign in with email and password
   */
  signIn(email, password) {
    return this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(data => {
      if (data.access_token) {
        this.saveToken(data.access_token)
      }
      return data
    })
  }

  /**
   * Get current student profile
   */
  getProfile() {
    if (!this.token) {
      throw new Error('No authentication token found')
    }
    return this.request(`/api/auth/profile?token=${this.token}`)
  }

  /**
   * Logout (clear token)
   */
  logout() {
    this.clearToken()
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token
  }

  // ===================== Complaints Endpoints =====================

  /**
   * Submit a new complaint
   */
  submitComplaint(name, title, category, priority, description) {
    return this.request('/api/complaints', {
      method: 'POST',
      body: JSON.stringify({
        name,
        title,
        category,
        priority,
        description,
      }),
    })
  }

  /**
   * Get all complaints with optional filters
   * @param {Object} filters - { category, status, priority }
   */
  getComplaints(filters = {}) {
    const params = new URLSearchParams()
    if (filters.category) params.append('category', filters.category)
    if (filters.status) params.append('status', filters.status)
    if (filters.priority) params.append('priority', filters.priority)

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/api/complaints${query}`)
  }

  /**
   * Get a specific complaint by ID
   */
  getComplaint(complaintId) {
    return this.request(`/api/complaints/${complaintId}`)
  }

  /**
   * Check complaint status by ID
   */
  checkComplaintStatus(complaintId) {
    return this.request(`/api/complaints/status/${complaintId}`)
  }

  /**
   * Update a complaint (admin/staff only)
   */
  updateComplaint(complaintId, status, resolutionNote) {
    return this.request(`/api/complaints/${complaintId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        resolution_note: resolutionNote,
      }),
    })
  }

  // ===================== Statistics Endpoints =====================

  /**
   * Get system statistics
   */
  getStatistics() {
    return this.request('/api/stats')
  }

  /**
   * Get complaint summary by category
   */
  getCategories() {
    return this.request('/api/categories')
  }

  // ===================== Health Check =====================

  /**
   * Check if backend is running
   */
  healthCheck() {
    return this.request('/api/health')
  }
}

// Export singleton instance
export default new ComplaintSystemAPI()
