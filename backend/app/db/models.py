from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON

# --- Models ---

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    telegram_chat_id: Optional[str] = None
    match_threshold: int = Field(default=7)
    preferences: Optional[dict] = Field(default={}, sa_column=Column(JSON))
    
    applications: List["Application"] = Relationship(back_populates="user")
    resumes: List["Resume"] = Relationship(back_populates="user")
    questions: List["Question"] = Relationship(back_populates="user")

class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    company: str
    url: str = Field(unique=True)
    description: Optional[str] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    posted_at: Optional[datetime] = None
    
    # Status
    status: str = Field(default="NEW") # NEW, SCANNED, APPLIED, INTERVIEW, OFFER, REJECTED
    
    # AI Scoring
    relevance_score: Optional[int] = None
    relevance_reason: Optional[str] = None
    
    # Metadata
    skills: List[str] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    applications: List["Application"] = Relationship(back_populates="job")
    contacts: List["Contact"] = Relationship(back_populates="job")

class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="job.id")
    user_id: int = Field(foreign_key="user.id")
    
    status: str = Field(default="APPLIED")
    current_round: int = Field(default=0)
    agent_logs: List[str] = Field(default=[], sa_column=Column(JSON))
    
    job: Job = Relationship(back_populates="applications")
    user: User = Relationship(back_populates="applications")

class Contact(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="job.id")
    
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None # Recruiter, HM, etc.
    notes: Optional[str] = None
    
    job: Job = Relationship(back_populates="contacts")

class Resume(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    version_name: str
    content_text: str # Parsed text for LLM
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="resumes")

class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    question_text: str # The generic question found on forms
    answer: str # The user's approved answer
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="questions")
