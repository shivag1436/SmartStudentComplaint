"""
Frontend Integration Guide for Student Complaint System Backend

This file provides examples of how to integrate the Python backend API 
with your React frontend.
"""

# ===================== CONFIGURATION =====================
# Create a config file in your frontend: src/config.js

API_BASE_URL = "http://localhost:8000"
API_ENDPOINTS = {
    "SIGNUP": f"{API_BASE_URL}/api/auth/signup",
    "SIGNIN": f"{API_BASE_URL}/api/auth/signin",
    "PROFILE": f"{API_BASE_URL}/api/auth/profile",
    "COMPLAINTS": f"{API_BASE_URL}/api/complaints",
    "COMPLAINT_STATUS": f"{API_BASE_URL}/api/complaints/status",
    "STATS": f"{API_BASE_URL}/api/stats",
    "CATEGORIES": f"{API_BASE_URL}/api/categories",
    "HEALTH": f"{API_BASE_URL}/api/health",
}

# ===================== REACT API SERVICE =====================
# Create a file: src/services/api.js

class ComplaintAPI {
    constructor(baseURL) {
        this.baseURL = baseURL
        this.token = this.getToken()
    }
    
    # Save and retrieve token from localStorage
    saveToken(token):
        localStorage.setItem('auth-token', token)
        this.token = token
    
    getToken():
        return localStorage.getItem('auth-token')
    
    clearToken():
        localStorage.removeItem('auth-token')
        this.token = None
    
    # Make API request with error handling
    async request(url, options={}):
        try:
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            })
            
            if not response.ok:
                throw Error(f"API Error: {response.status} {response.statusText}")
            
            return response.json()
        except error:
            console.error('API Request Error:', error)
            raise error
    
    # ===================== AUTHENTICATION =====================
    
    async signUp(firstName, lastName, email, mobileNumber, password):
        return this.request(f"{this.baseURL}/api/auth/signup", {
            method: 'POST',
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                mobile_number: mobileNumber,
                password: password
            })
        })
    
    async signIn(email, password):
        data = await this.request(f"{this.baseURL}/api/auth/signin", {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        
        if data.access_token:
            this.saveToken(data.access_token)
        
        return data
    
    async getProfile():
        return this.request(
            f"{this.baseURL}/api/auth/profile?token={this.token}"
        )
    
    logout():
        this.clearToken()
    
    # ===================== COMPLAINTS =====================
    
    async submitComplaint(name, title, category, priority, description):
        return this.request(f"{this.baseURL}/api/complaints", {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                title: title,
                category: category,
                priority: priority,
                description: description
            })
        })
    
    async getComplaints(category=None, status=None, priority=None):
        params = new URLSearchParams()
        if category:
            params.append('category', category)
        if status:
            params.append('status', status)
        if priority:
            params.append('priority', priority)
        
        query = params.toString() ? f"?{params.toString()}" : ""
        return this.request(f"{this.baseURL}/api/complaints{query}")
    
    async getComplaint(complaintId):
        return this.request(f"{this.baseURL}/api/complaints/{complaintId}")
    
    async checkComplaintStatus(complaintId):
        return this.request(f"{this.baseURL}/api/complaints/status/{complaintId}")
    
    async updateComplaint(complaintId, status=None, resolutionNote=None):
        return this.request(f"{this.baseURL}/api/complaints/{complaintId}", {
            method: 'PUT',
            body: JSON.stringify({
                status: status,
                resolution_note: resolutionNote
            })
        })
    
    # ===================== STATISTICS =====================
    
    async getStatistics():
        return this.request(f"{this.baseURL}/api/stats")
    
    async getCategories():
        return this.request(f"{this.baseURL}/api/categories")

# ===================== REACT COMPONENT EXAMPLE =====================
# Update your App.jsx to use the API

"""
// In your App.jsx

import { useEffect, useState } from 'react'
import './App.css'
import api from './services/api'

const API_BASE_URL = "http://localhost:8000"

function App() {
  const [complaints, setComplaints] = useState([])
  const [authToken, setAuthToken] = useState(localStorage.getItem('auth-token'))
  
  // Load complaints from backend
  useEffect(() => {
    loadComplaints()
  }, [])
  
  async function loadComplaints() {
    const apiService = new ComplaintAPI(API_BASE_URL)
    const data = await apiService.getComplaints()
    setComplaints(data)
  }
  
  // Handle sign up
  async function handleSignUp(firstName, lastName, email, mobile, password) {
    const apiService = new ComplaintAPI(API_BASE_URL)
    const result = await apiService.signUp(firstName, lastName, email, mobile, password)
    return result
  }
  
  // Handle sign in
  async function handleSignIn(email, password) {
    const apiService = new ComplaintAPI(API_BASE_URL)
    const result = await apiService.signIn(email, password)
    setAuthToken(result.access_token)
    return result
  }
  
  // Handle complaint submission
  async function handleComplaintSubmit(name, title, category, priority, description) {
    const apiService = new ComplaintAPI(API_BASE_URL)
    const result = await apiService.submitComplaint(name, title, category, priority, description)
    await loadComplaints()
    return result
  }
  
  // Handle status check
  async function checkStatus(complaintId) {
    const apiService = new ComplaintAPI(API_BASE_URL)
    const result = await apiService.checkComplaintStatus(complaintId)
    return result
  }
  
  return (
    <div className="app-shell">
      {/* Your JSX here */}
    </div>
  )
}

export default App
"""

# ===================== CHANGES TO MAKE IN REACT COMPONENT =====================

# 1. In handleSignUpSubmit:
# Replace:
#   setAuthBanner(...)
# With:
#   const result = await handleSignUp(signUpForm.firstName, signUpForm.lastName, 
#                                      signUpForm.email, signUpForm.mobileNumber, 
#                                      signUpForm.password)
#   setAuthBanner({ type: 'success', title: result.message, ... })

# 2. In handleSignInSubmit:
# Replace:
#   setAuthBanner(...)
# With:
#   const result = await handleSignIn(signInForm.email, signInForm.password)
#   setAuthBanner({ type: 'success', title: 'Sign-in successful', ... })

# 3. In handleComplaintSubmit:
# Replace:
#   setComplaints(...) [localStorage]
# With:
#   await handleComplaintSubmit(complaintForm.name, complaintForm.title, ...)
#   setFeedback('Complaint submitted successfully...')

# 4. In checkStatus:
# Replace:
#   const complaint = complaints.find(...)
# With:
#   const result = await checkStatus(Number(statusQuery))
#   setStatusResult(result)

print("Integration complete! The backend is ready to use.")
