from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Student Models
class StudentSignUp(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile_number: str
    password: str

class StudentSignIn(BaseModel):
    email: EmailStr
    password: str

class StudentResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    mobile_number: str
    created_at: datetime

    class Config:
        from_attributes = True

class StudentProfile(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    mobile_number: str

# Complaint Models
class ComplaintCreate(BaseModel):
    name: str
    title: str
    category: str
    priority: str
    description: str

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    resolution_note: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    title: str
    category: str
    priority: str
    status: str
    description: str
    date_submitted: datetime
    date_updated: datetime
    resolution_note: Optional[str] = None

    class Config:
        from_attributes = True

class ComplaintStatusCheck(BaseModel):
    complaint_id: int

# Auth Response
class Token(BaseModel):
    access_token: str
    token_type: str
    student_id: int

class AuthMessage(BaseModel):
    message: str
    success: bool
