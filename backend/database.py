from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Database URL - prefers Supabase Postgres when configured, otherwise falls back to SQLite.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./complaint_system.db"
)

engine_kwargs = {}
if "sqlite" in DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    mobile_number = Column(String(15), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Complaint(Base):
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    student_name = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    priority = Column(String(20), nullable=False)  # Low, Medium, High
    status = Column(String(20), default="Submitted")  # Submitted, In Review, Resolved
    description = Column(Text, nullable=False)
    date_submitted = Column(DateTime, default=datetime.utcnow, index=True)
    date_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolution_note = Column(Text, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
