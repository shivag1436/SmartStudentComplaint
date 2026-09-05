# Backend API Quick Reference

## Project Structure

```
ComplaintSystem/
├── backend/                  # Python FastAPI backend ✅ READY
│   ├── main.py              # Main application with routes
│   ├── database.py          # Database configuration
│   ├── schemas.py           # Pydantic validation models
│   ├── security.py          # Auth & password handling
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment config
│   ├── .gitignore           # Git ignore rules
│   ├── run.bat              # Windows quick start
│   ├── run.sh               # Unix quick start
│   ├── README.md            # Backend documentation
│   └── complaint_system.db  # SQLite database
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js       # API client ✅ READY
│   │   ├── config.js        # API config ✅ READY
│   │   └── App.jsx          # Main app (see INTEGRATION_GUIDE.md)
│   └── package.json
│
├── INTEGRATION_GUIDE.md      # Step-by-step integration
└── BACKEND_SETUP_COMPLETE.md # This document
```

## Backend API Routes

### Health & Root
```
GET  /              Root endpoint
GET  /api/health    Health check
```

### Authentication
```
POST /api/auth/signup      Register new student
POST /api/auth/signin      Login student
GET  /api/auth/profile     Get student profile
```

### Complaints
```
POST   /api/complaints              Submit complaint
GET    /api/complaints              List complaints
GET    /api/complaints/{id}         Get specific complaint
GET    /api/complaints/status/{id}  Check status by ID
PUT    /api/complaints/{id}         Update complaint
```

### Analytics
```
GET /api/stats        Get system statistics
GET /api/categories   Get category summary
```

## Database Models

### Student
```python
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile_number": "1234567890",
  "created_at": "2026-08-29T10:00:00"
}
```

### Complaint
```python
{
  "id": 101,
  "student_id": 1,
  "student_name": "John Doe",
  "title": "Hostel Wi-Fi Issue",
  "category": "Hostel",
  "priority": "High",
  "status": "Submitted",
  "description": "Wi-Fi in Block B is not working",
  "date_submitted": "2026-08-29T10:00:00",
  "date_updated": "2026-08-29T10:00:00",
  "resolution_note": null
}
```

## Common API Requests

### Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "mobile_number": "1234567890",
    "password": "secure123"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### Submit Complaint
```bash
curl -X POST http://localhost:8000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "title": "Library seating",
    "category": "Facilities",
    "priority": "Medium",
    "description": "Not enough seats in study area"
  }'
```

### Get All Complaints
```bash
curl http://localhost:8000/api/complaints
```

### Filter Complaints
```bash
# By category
curl "http://localhost:8000/api/complaints?category=Hostel"

# By status
curl "http://localhost:8000/api/complaints?status=Resolved"

# By priority
curl "http://localhost:8000/api/complaints?priority=High"

# Multiple filters
curl "http://localhost:8000/api/complaints?category=Hostel&status=In%20Review"
```

### Check Status by ID
```bash
curl http://localhost:8000/api/complaints/status/101
```

### Get Stats
```bash
curl http://localhost:8000/api/stats
```

## Environment Variables (.env)

```bash
# Database
DATABASE_URL=sqlite:///./complaint_system.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/complaint_db

# Security
SECRET_KEY=complaint-system-secret-key-2024-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Server
HOST=0.0.0.0
PORT=8000

# Frontend
FRONTEND_URL=http://localhost:5173
```

## JavaScript/React Usage

```javascript
// Import the API service
import api from './services/api.js'

// Sign up
await api.signUp(firstName, lastName, email, mobile, password)

// Sign in
const token = await api.signIn(email, password)

// Submit complaint
await api.submitComplaint(name, title, category, priority, description)

// Get complaints
const complaints = await api.getComplaints({ category: 'Hostel' })

// Check status
const result = await api.checkComplaintStatus(complaintId)

// Get stats
const stats = await api.getStatistics()

// Get categories
const categories = await api.getCategories()
```

## Starting Services

### Backend (Terminal 1)
```bash
cd backend
# Option 1: Using batch file (Windows)
run.bat

# Option 2: Using shell script (Unix)
bash run.sh

# Option 3: Manual
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React app |
| Backend API | http://localhost:8000 | API server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Alt Docs | http://localhost:8000/redoc | ReDoc |
| Health Check | http://localhost:8000/api/health | Server status |

## Categories

Available complaint categories:
- Academic
- Faculty
- College Management
- Library Management
- Facilities
- Hostel
- Transport
- Examination
- Administrative

## Status Values

- `Submitted` - Complaint just submitted
- `In Review` - Admin reviewing it
- `Resolved` - Complaint resolved

## Priority Levels

- `Low` - Not urgent
- `Medium` - Standard priority
- `High` - Urgent

## Error Handling

All API errors return JSON with error details:

```json
{
  "detail": "Email already registered"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Database File

The SQLite database is stored at:
```
c:\ComplaintSystem\backend\complaint_system.db
```

To reset the database, simply delete this file and restart the server. It will be recreated automatically.

## Switching to PostgreSQL

1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE complaint_db;
   ```
3. Update `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/complaint_db
   ```
4. Install driver:
   ```bash
   pip install psycopg2-binary
   ```
5. Restart backend

## Production Checklist

- [ ] Change SECRET_KEY to random string
- [ ] Update FRONTEND_URL to actual domain
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set DEBUG=False
- [ ] Configure SSL/HTTPS
- [ ] Set up logging
- [ ] Configure backup strategy
- [ ] Set environment-specific settings

---

**Happy building!** 🚀

For more details, see:
- `backend/README.md` - Detailed backend documentation
- `INTEGRATION_GUIDE.md` - Frontend integration steps
