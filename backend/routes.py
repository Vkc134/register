from fastapi import APIRouter, HTTPException, Body, Depends, status
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional
from models import Candidate, CandidateCreate, User, UserCreate, LoginRequest
from database import candidates_collection, users_collection
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(**user.model_dump())
    hashed_password = get_password_hash(user.password)
    
    user_dict = new_user.model_dump()
    user_dict["password"] = hashed_password
    
    await users_collection.insert_one(user_dict)
    return new_user

@router.post("/login")
async def login(login_request: LoginRequest):
    user = await users_collection.find_one({"email": login_request.email})
    if not user or not verify_password(login_request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, expires_delta=access_token_expires
    )
    
    return {
        "user": {
            "name": user["email"].split("@")[0],
            "email": user["email"],
            "role": user["role"]
        },
        "token": access_token
    }

@router.get("/candidates", response_model=List[Candidate])
async def get_candidates(current_user: dict = Depends(get_current_user)):
    # Optional: Check if current_user role is admin
    if current_user["role"] != "admin":
         raise HTTPException(status_code=403, detail="Not authorized")
         
    candidates = []
    cursor = candidates_collection.find({})
    async for document in cursor:
        candidates.append(Candidate(**document))
    return candidates

@router.post("/candidates", response_model=Candidate)
async def create_candidate(candidate: CandidateCreate):
    new_candidate = Candidate(**candidate.model_dump())
    await candidates_collection.insert_one(new_candidate.model_dump())
    return new_candidate

@router.put("/candidates/{id}/mark-viewed")
async def mark_candidate_viewed(id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
         raise HTTPException(status_code=403, detail="Not authorized")

    result = await candidates_collection.update_one(
        {"id": id}, {"$set": {"isViewed": True}}
    )
    if result.modified_count == 1:
        return {"message": "Candidate marked as viewed"}
    return {"message": "Candidate not found or already viewed"}
