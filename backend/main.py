from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import List, Optional

from database import get_db, engine, Base, Student, Complaint
from schemas import (
    StudentSignUp, StudentSignIn, StudentResponse, 
    ComplaintCreate, ComplaintResponse, Token, AuthMessage, ComplaintUpdate
)
from security import hash_password, verify_password, create_access_token, decode_token

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Student Complaint System API",
    description="API for managing student complaints",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== AUTHENTICATION ENDPOINTS =====================

@app.post("/api/auth/signup", response_model=AuthMessage)
def sign_up(student_data: StudentSignUp, db: Session = Depends(get_db)):
    """
    Register a new student account
    """
    # Check if email already exists
    existing_student = db.query(Student).filter(Student.email == student_data.email).first()
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new student
    new_student = Student(
        first_name=student_data.first_name,
        last_name=student_data.last_name,
        email=student_data.email,
        mobile_number=student_data.mobile_number,
        hashed_password=hash_password(student_data.password)
    )
    
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    return {
        "message": "Sign-up successful. Your account details were captured successfully.",
        "success": True
    }

@app.post("/api/auth/signin", response_model=Token)
def sign_in(credentials: StudentSignIn, db: Session = Depends(get_db)):
    """
    Authenticate a student and return access token
    """
    # Find student by email
    student = db.query(Student).filter(Student.email == credentials.email).first()
    
    if not student or not verify_password(credentials.password, student.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(student.id), "email": student.email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student_id": student.id
    }

@app.get("/api/auth/profile", response_model=StudentResponse)
def get_profile(token: str = Query(None), db: Session = Depends(get_db)):
    """
    Get current student profile
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    student_id = int(payload.get("sub"))
    student = db.query(Student).filter(Student.id == student_id).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student

# ===================== COMPLAINT ENDPOINTS =====================

@app.post("/api/complaints", response_model=ComplaintResponse)
def create_complaint(complaint_data: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Submit a new complaint
    """
    # Create new complaint
    new_complaint = Complaint(
        student_id=1,  # This should come from authenticated user
        student_name=complaint_data.name,
        title=complaint_data.title,
        category=complaint_data.category,
        priority=complaint_data.priority,
        description=complaint_data.description,
        status="Submitted"
    )
    
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    return new_complaint

@app.get("/api/complaints", response_model=List[ComplaintResponse])
def get_complaints(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get all complaints with optional filtering
    
    Query Parameters:
    - category: Filter by category (Academic, Faculty, etc.)
    - status: Filter by status (Submitted, In Review, Resolved)
    - priority: Filter by priority (Low, Medium, High)
    """
    query = db.query(Complaint)
    
    # Apply filters if provided
    if category:
        query = query.filter(Complaint.category == category)
    if status:
        query = query.filter(Complaint.status == status)
    if priority:
        query = query.filter(Complaint.priority == priority)
    
    # Order by date (newest first)
    complaints = query.order_by(Complaint.date_submitted.desc()).all()
    return complaints

@app.get("/api/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    """
    Get a specific complaint by ID
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    return complaint

@app.put("/api/complaints/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: int,
    complaint_update: ComplaintUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a complaint (admin/staff only)
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    # Update fields if provided
    if complaint_update.status:
        complaint.status = complaint_update.status
    if complaint_update.resolution_note:
        complaint.resolution_note = complaint_update.resolution_note
    
    complaint.date_updated = datetime.utcnow()
    
    db.commit()
    db.refresh(complaint)
    
    return complaint

@app.get("/api/complaints/status/{complaint_id}")
def check_status(complaint_id: int, db: Session = Depends(get_db)):
    """
    Check the status of a complaint by ID
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        return {
            "found": False,
            "message": "No complaint found for that ID. Please try another number."
        }
    
    return {
        "found": True,
        "complaint": {
            "id": complaint.id,
            "title": complaint.title,
            "category": complaint.category,
            "priority": complaint.priority,
            "status": complaint.status,
            "note": complaint.description,
            "studentName": complaint.student_name,
            "date": complaint.date_submitted.strftime("%b %d")
        }
    }

# ===================== STATISTICS ENDPOINTS =====================

@app.get("/api/stats")
def get_statistics(db: Session = Depends(get_db)):
    """
    Get complaint system statistics
    """
    total_complaints = db.query(Complaint).count()
    in_progress = db.query(Complaint).filter(Complaint.status != "Resolved").count()
    resolved = db.query(Complaint).filter(Complaint.status == "Resolved").count()
    urgent = db.query(Complaint).filter(Complaint.priority == "High").count()
    
    return {
        "total_complaints": total_complaints,
        "in_progress": in_progress,
        "resolved": resolved,
        "urgent": urgent
    }

@app.get("/api/categories")
def get_category_summary(db: Session = Depends(get_db)):
    """
    Get complaint count by category
    """
    categories = [
        "Academic", "Faculty", "College Management", "Library Management",
        "Facilities", "Hostel", "Transport", "Examination", "Administrative"
    ]
    
    summary = []
    for category in categories:
        count = db.query(Complaint).filter(Complaint.category == category).count()
        summary.append({"name": category, "count": count})
    
    return summary

# ===================== HEALTH CHECK =====================

@app.get("/api/health")
def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "message": "Student Complaint System API is running"
    }

@app.get("/")
def root():
    """
    Root endpoint
    """
    return {
        "message": "Student Complaint System API",
        "docs": "/docs",
        "health": "/api/health"
    }
