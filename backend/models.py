from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: EmailStr
    role: str = "candidate" # 'admin' or 'candidate'

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # In a real app, do NOT return password. verified: bool = False

    class Config:
        populate_by_name = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    mobileNumber: str
    currentLocation: str
    panNumber: Optional[str] = None
    highestEducation: str
    passedOutYear: str
    skill: str
    isFresher: str
    totalExperience: Optional[str] = None
    relevantExperience: Optional[str] = None
    currentCompany: Optional[str] = None
    previousCompanies: Optional[str] = None
    isCurrentlyWorking: Optional[str] = None
    currentCTC: Optional[str] = None
    expectedCTC: Optional[str] = None
    noticePeriod: Optional[str] = None
    hasForm16: Optional[str] = None
    hasPF: Optional[str] = None
    careerGaps: Optional[str] = None
    overlaps: Optional[str] = None
    status: str = "Pending"

class CandidateCreate(CandidateBase):
    pass

class Candidate(CandidateBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    submittedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    isViewed: bool = False

    class Config:
        populate_by_name = True
