# Smart Student Complaint System - Backend API

Python FastAPI backend for the Student Complaint System.

## Features

✅ Student authentication (Sign Up / Sign In)
✅ JWT token-based authentication
✅ Create and manage complaints
✅ Filter complaints by category, status, priority
✅ Check complaint status by ID
✅ System statistics (total, in progress, resolved, urgent)
✅ CORS enabled for frontend integration
✅ SQLite database (easily switchable to PostgreSQL)

## Installation

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create a virtual environment (recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
Edit `.env` file with your configuration:
```
DATABASE_URL=sqlite:///./complaint_system.db
SECRET_KEY=your-secret-key
```

### 5. Run the server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once the server is running, you can view interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile_number": "1234567890",
  "password": "password123"
}
```

#### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "student_id": 1
}
```

#### Get Profile
```http
GET /api/auth/profile?token=eyJhbGc...
```

### Complaints

#### Submit a Complaint
```http
POST /api/complaints
Content-Type: application/json

{
  "name": "John Doe",
  "title": "Hostel Wi-Fi issue",
  "category": "Hostel",
  "priority": "High",
  "description": "The Wi-Fi in Block B is not working"
}
```

#### Get All Complaints
```http
GET /api/complaints
GET /api/complaints?category=Hostel
GET /api/complaints?status=Submitted
GET /api/complaints?priority=High
GET /api/complaints?category=Hostel&status=In%20Review
```

#### Get Specific Complaint
```http
GET /api/complaints/{complaint_id}
```

#### Check Complaint Status (by ID)
```http
GET /api/complaints/status/{complaint_id}
```

#### Update Complaint (Admin)
```http
PUT /api/complaints/{complaint_id}
Content-Type: application/json

{
  "status": "In Review",
  "resolution_note": "Issue is being investigated"
}
```

### Statistics

#### Get Statistics
```http
GET /api/stats

Response:
{
  "total_complaints": 10,
  "in_progress": 7,
  "resolved": 3,
  "urgent": 4
}
```

#### Get Category Summary
```http
GET /api/categories

Response:
[
  { "name": "Academic", "count": 2 },
  { "name": "Hostel", "count": 3 },
  ...
]
```

### Health Check
```http
GET /api/health
```

## Database Schema

### Students Table
- `id` (Primary Key)
- `first_name` (String)
- `last_name` (String)
- `email` (String, Unique)
- `mobile_number` (String)
- `hashed_password` (String)
- `created_at` (DateTime)

### Complaints Table
- `id` (Primary Key)
- `student_id` (Foreign Key)
- `student_name` (String)
- `title` (String)
- `category` (String)
- `priority` (String)
- `status` (String)
- `description` (Text)
- `date_submitted` (DateTime)
- `date_updated` (DateTime)
- `resolution_note` (Text, Optional)

## Frontend Integration

Update your React frontend to use these API endpoints. Example:

```javascript
// Sign Up
fetch('http://localhost:8000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(signUpData)
})

// Submit Complaint
fetch('http://localhost:8000/api/complaints', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(complaintData)
})

// Get Complaints
fetch('http://localhost:8000/api/complaints?category=Hostel')

// Check Status
fetch('http://localhost:8000/api/complaints/status/101')
```

## Database Setup

### SQLite (Default - Development)
Already configured. Database file will be created automatically as `complaint_system.db`

### PostgreSQL (Production)
1. Create a PostgreSQL database
2. Update `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/complaint_db
```
3. Install PostgreSQL driver: `pip install psycopg2-binary`
4. Run the server

## Troubleshooting

**CORS Error**: Make sure the backend is running and frontend URL is in allowed origins.

**Database Error**: Check if the database file has write permissions or PostgreSQL connection string.

**Port Already in Use**: Change port in command: `uvicorn main:app --port 8001`

## Production Deployment

For production deployment:
1. Set `SECRET_KEY` to a strong random string
2. Use PostgreSQL instead of SQLite
3. Set up environment variables securely
4. Use a production ASGI server (Gunicorn, etc.)
5. Enable HTTPS/SSL
6. Set proper CORS origins (not `*`)

Example production run:
```bash
gunicorn -w 4 -b 0.0.0.0:8000 -k uvicorn.workers.UvicornWorker main:app
```

## Support

For issues or questions, check the API documentation at `/docs` endpoint.
