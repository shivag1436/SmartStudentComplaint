# Frontend Integration Guide

This guide explains how to update your React frontend to use the Python FastAPI backend.

## Files to Create/Update

### 1. ✅ Already Created: `src/services/api.js`
This file contains the `ComplaintSystemAPI` class that handles all API communication.

### 2. ✅ Already Created: `src/config.js`
Configuration file with API endpoints and base URL.

### 3. 🔄 Update: `src/App.jsx`
Main application component needs to be updated to use the API.

## Step-by-Step Changes to App.jsx

### Import the API service at the top:

```javascript
import api from './services/api'
import './App.css'
```

### Update State Initialization:

```javascript
function App() {
  const [theme, setTheme] = useState('dark')
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(false)
  
  // ... rest of state declarations
}
```

### Add useEffect to Load Data from Backend:

```javascript
useEffect(() => {
  // Check if backend is available
  api.healthCheck()
    .then(() => setApiAvailable(true))
    .catch(err => {
      console.warn('Backend not available:', err)
      setApiAvailable(false)
    })

  // Load complaints from backend
  loadComplaints()
}, [])

async function loadComplaints() {
  try {
    setLoading(true)
    const data = await api.getComplaints()
    setComplaints(data)
  } catch (err) {
    console.error('Failed to load complaints:', err)
    // Fallback to localStorage if API is down
  } finally {
    setLoading(false)
  }
}
```

### Update handleSignUpSubmit:

Replace the existing function with:

```javascript
const handleSignUpSubmit = async (event) => {
  event.preventDefault()

  const missingFields = Object.values(signUpForm).some((value) => !String(value).trim())

  if (missingFields) {
    setAuthMessage('Please fill in all sign-up details before continuing.')
    return
  }

  try {
    setLoading(true)
    const result = await api.signUp(
      signUpForm.firstName,
      signUpForm.lastName,
      signUpForm.email,
      signUpForm.mobileNumber,
      signUpForm.password
    )

    setAuthMessage('')
    setAuthBanner({
      type: 'success',
      title: 'Sign-up successful',
      detail: result.message || 'Your account details were captured successfully.',
    })
    setAuthModal(null)
    setSignUpForm({
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      password: '',
    })
  } catch (error) {
    setAuthMessage(error.message || 'Sign-up failed. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

### Update handleSignInSubmit:

Replace with:

```javascript
const handleSignInSubmit = async (event) => {
  event.preventDefault()

  if (!signInForm.email.trim() || !signInForm.password.trim()) {
    setAuthMessage('Please enter your email and password to continue.')
    return
  }

  try {
    setLoading(true)
    const result = await api.signIn(signInForm.email, signInForm.password)

    setAuthMessage('')
    setAuthBanner({
      type: 'success',
      title: 'Sign-in successful',
      detail: 'Welcome back! Your sign-in details were captured.',
    })
    setAuthModal(null)
    setSignInForm({ email: '', password: '' })
  } catch (error) {
    setAuthMessage(error.message || 'Sign-in failed. Please check your credentials.')
  } finally {
    setLoading(false)
  }
}
```

### Update handleComplaintSubmit:

Replace with:

```javascript
const handleComplaintSubmit = async (event) => {
  event.preventDefault()

  if (!complaintForm.name.trim() || !complaintForm.title.trim() || !complaintForm.description.trim()) {
    setFeedback('Please add your name, a title, and a clear description before submitting.')
    return
  }

  try {
    setLoading(true)
    await api.submitComplaint(
      complaintForm.name,
      complaintForm.title,
      complaintForm.category,
      complaintForm.priority,
      complaintForm.description
    )

    // Reload complaints
    await loadComplaints()

    setComplaintForm({ 
      name: '', 
      title: '', 
      category: 'Academic', 
      priority: 'Medium', 
      description: '' 
    })
    setFeedback('Complaint submitted successfully. You can check its status anytime.')
  } catch (error) {
    setFeedback(`Failed to submit complaint: ${error.message}`)
  } finally {
    setLoading(false)
  }
}
```

### Update checkStatus:

Replace with:

```javascript
const checkStatus = async (event) => {
  event.preventDefault()

  const id = Number(statusQuery)
  if (!id) {
    setStatusResult({ found: false, message: 'Please enter a valid complaint ID number.' })
    return
  }

  try {
    setLoading(true)
    const result = await api.checkComplaintStatus(id)
    setStatusResult(result)
  } catch (error) {
    setStatusResult({ 
      found: false, 
      message: `Error checking status: ${error.message}` 
    })
  } finally {
    setLoading(false)
  }
}
```

## Environment Variables

Create or update `.env` in your frontend directory:

```
REACT_APP_API_URL=http://localhost:8000
```

For production:

```
REACT_APP_API_URL=https://your-api-domain.com
```

## Running Both Frontend and Backend

### Terminal 1 - Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

Access the app at: http://localhost:5173

## Fallback to localStorage

If the backend is not available, the app should fall back to using localStorage. This allows development without the backend:

```javascript
async function loadComplaints() {
  try {
    if (apiAvailable) {
      const data = await api.getComplaints()
      setComplaints(data)
    } else {
      // Fallback to localStorage
      const savedComplaints = localStorage.getItem('student-complaints-list')
      if (savedComplaints) {
        setComplaints(JSON.parse(savedComplaints))
      }
    }
  } catch (err) {
    console.error('Error loading complaints:', err)
  }
}
```

## API Error Handling

The API service has built-in error handling. To handle errors in your components:

```javascript
try {
  const result = await api.submitComplaint(...)
} catch (error) {
  // error.message contains the error details
  console.error('API Error:', error.message)
  setFeedback(`Error: ${error.message}`)
}
```

## Testing the API

Once both servers are running:

1. **Check Backend**: http://localhost:8000/docs
2. **Sign Up**: Use the form in the app
3. **Sign In**: Use credentials from sign up
4. **Submit Complaint**: Submit a test complaint
5. **View Complaints**: See them listed on the dashboard
6. **Check Status**: Use the status tracker with the complaint ID

## Troubleshooting

### CORS Error
- Make sure backend is running on port 8000
- Check that frontend URL is in CORS allowed origins in `main.py`

### Connection Refused
- Backend might not be running
- Check port 8000 is not in use: `lsof -i :8000` (macOS/Linux) or `netstat -ano | findstr :8000` (Windows)

### Data Not Persisting
- Check that database file (`complaint_system.db`) is created
- Verify permissions in the backend directory

### Token Errors
- Clear localStorage and sign in again
- Check that SECRET_KEY in `.env` is set

## Next Steps

1. Set up PostgreSQL for production
2. Add email notifications for complaint updates
3. Implement admin dashboard for managing complaints
4. Add file upload for evidence/attachments
5. Deploy to production server

See `backend/README.md` for more information.
