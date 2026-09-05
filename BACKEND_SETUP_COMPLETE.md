# Python Backend for Smart Student Complaint System ✅

Your Python FastAPI backend is now fully set up and running!

## 🎉 What's Been Created

### Backend Files:
```
backend/
├── main.py                 # FastAPI application with all endpoints
├── database.py             # SQLAlchemy database configuration & models
├── schemas.py              # Pydantic models for request/response validation
├── security.py             # Password hashing & JWT authentication
├── requirements.txt        # Python dependencies
├── .env                    # Environment configuration
├── .env.example            # Example environment template
├── .gitignore              # Git ignore rules
├── run.bat                 # Quick start script (Windows)
├── run.sh                  # Quick start script (macOS/Linux)
├── README.md               # Backend documentation
└── complaint_system.db     # SQLite database (auto-created)
```

### Frontend Integration Files:
```
frontend/
├── src/services/api.js     # API service class for backend communication
├── src/config.js           # API configuration
└── (other frontend files remain unchanged)
```

### Documentation:
```
INTEGRATION_GUIDE.md        # Step-by-step guide to connect frontend & backend
```

## 🚀 Backend Features

✅ **Authentication System**
- Student sign-up with email verification
- Secure sign-in with JWT tokens
- Password hashing with bcrypt
- Session management

✅ **Complaint Management**
- Submit complaints with category, priority, description
- Filter complaints by category, status, priority
- Check complaint status by ID
- Update complaints (admin functionality)

✅ **Statistics & Reporting**
- Total complaints count
- In-progress complaints count
- Resolved complaints count
- High-priority complaints count
- Category-wise complaint distribution

✅ **Database**
- SQLite for development (included)
- Easy switch to PostgreSQL for production
- Automatic table creation

✅ **API Documentation**
- Interactive Swagger UI at `/docs`
- ReDoc documentation at `/redoc`
- Health check endpoint at `/api/health`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new student
- `POST /api/auth/signin` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile

### Complaints
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints` - List all complaints (with filters)
- `GET /api/complaints/{id}` - Get specific complaint
- `GET /api/complaints/status/{id}` - Check complaint status
- `PUT /api/complaints/{id}` - Update complaint status

### Statistics
- `GET /api/stats` - System statistics
- `GET /api/categories` - Category summary
- `GET /api/health` - Health check

## ✅ Server Status

**Backend Status**: ✅ **RUNNING**
- **URL**: http://localhost:8000
- **Port**: 8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: ✅ Passing

**Frontend Status**: ✅ **RUNNING**
- **URL**: http://localhost:5173
- **Port**: 5173

## 📝 Quick Start

### Backend (Python FastAPI)

**Option 1: Windows Batch File**
```bash
cd backend
run.bat
```

**Option 2: Manual Installation**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Option 3: Using Python Directly (Current)**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Frontend (React + Vite)

**In another terminal:**
```bash
cd frontend
npm run dev
```

## 🔗 Connecting Frontend to Backend

### 1. The API Service is Already Created!
Located at `frontend/src/services/api.js` - ready to use.

### 2. Import in Your React Components
```javascript
import api from './services/api.js'

// Sign in
const result = await api.signIn(email, password)

// Submit complaint
await api.submitComplaint(name, title, category, priority, description)

// Get complaints
const complaints = await api.getComplaints({ category: 'Hostel' })

// Check status
const status = await api.checkComplaintStatus(complaintId)
```

### 3. Update App.jsx (Optional)
See `INTEGRATION_GUIDE.md` for detailed instructions on updating `App.jsx` to use the backend API instead of localStorage.

## 🧪 Testing the API

### Using Browser
1. Visit http://localhost:8000/docs
2. Click on any endpoint
3. Try it out!

### Example: Sign In
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

### Example: Get All Complaints
```bash
curl http://localhost:8000/api/complaints
```

### Example: Submit Complaint
```bash
curl -X POST http://localhost:8000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "title":"Hostel Wi-Fi Issue",
    "category":"Hostel",
    "priority":"High",
    "description":"No Wi-Fi in Block B"
  }'
```

## 📊 Database Schema

### Students Table
- `id` - Primary key
- `first_name` - Student's first name
- `last_name` - Student's last name  
- `email` - Unique email address
- `mobile_number` - Phone number
- `hashed_password` - Bcrypt hashed password
- `created_at` - Registration timestamp

### Complaints Table
- `id` - Primary key
- `student_id` - Reference to student
- `student_name` - Student's name
- `title` - Complaint title
- `category` - Category (Academic, Hostel, etc.)
- `priority` - Priority level (Low, Medium, High)
- `status` - Status (Submitted, In Review, Resolved)
- `description` - Full complaint description
- `date_submitted` - When submitted
- `date_updated` - Last update time
- `resolution_note` - Admin notes

## 🔐 Security Features

✅ **Password Security**
- Bcrypt hashing (4.1.1)
- Salted passwords
- Never stored in plain text

✅ **Authentication**
- JWT tokens (python-jose)
- Token expiration (24 hours default)
- Secret key configuration

✅ **CORS**
- Configured for frontend (localhost:5173)
- Can be modified in `main.py`

## ⚙️ Configuration

Edit `backend/.env` to configure:
```
DATABASE_URL=sqlite:///./complaint_system.db
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
```

## 📦 Dependencies Installed

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlalchemy** - ORM
- **pydantic** - Data validation
- **bcrypt** - Password hashing
- **python-jose** - JWT tokens
- **passlib** - Password utilities
- **email-validator** - Email validation
- **python-dotenv** - Environment variables

## 🚀 Production Deployment

### Switch to PostgreSQL:
1. Uncomment in `requirements.txt`: `psycopg2-binary==2.9.9`
2. Update `.env`: `DATABASE_URL=postgresql://user:pass@host:5432/db`
3. Install: `pip install psycopg2-binary`

### Deploy with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 -k uvicorn.workers.UvicornWorker main:app
```

### Docker Container:
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📚 Next Steps

1. **Test the Frontend + Backend**
   - Visit http://localhost:5173
   - Sign up as a student
   - Submit a complaint
   - Check the backend database

2. **Update React Components** (Optional)
   - Follow `INTEGRATION_GUIDE.md`
   - Replace localStorage with API calls
   - Remove test data when using real database

3. **Add Admin Features** (Future)
   - Admin dashboard to manage complaints
   - Bulk status updates
   - Email notifications

4. **Deploy to Production**
   - Set up PostgreSQL
   - Configure domain & SSL
   - Deploy on cloud (Heroku, AWS, etc.)

## 🆘 Troubleshooting

### Backend won't start
- Check if port 8000 is available: `netstat -ano | findstr :8000`
- Ensure Python is installed: `python --version`
- Check all dependencies: `pip list`

### CORS Error
- Backend not running? Start it first
- Wrong CORS origin? Check `main.py` CORS settings
- Clear browser cache and reload

### Database Error
- Delete `complaint_system.db` to reset
- Check write permissions in backend folder
- Use absolute paths in DATABASE_URL

### Frontend can't connect to backend
- Check if backend is running on http://localhost:8000
- Check browser console for errors (F12)
- Verify `frontend/src/config.js` API_BASE_URL

## 📞 Support

- **Backend Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Backend README**: `backend/README.md`
- **Integration Guide**: `INTEGRATION_GUIDE.md`

---

✨ **Your Smart Student Complaint System backend is ready to use!** ✨

**Current Status:**
- ✅ Backend: RUNNING (http://localhost:8000)
- ✅ Frontend: RUNNING (http://localhost:5173)
- ✅ API Documentation: Available at /docs
- ✅ Database: SQLite (auto-created)
- ✅ Authentication: Ready to use

Start building! 🚀
