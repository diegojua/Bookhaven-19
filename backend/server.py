from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import shutil
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# File upload
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Book(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    author: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    file_url: str
    file_format: str
    file_size: int
    language: str = "pt"
    category: str = "fiction"
    total_pages: int = 0
    total_chapters: int = 0
    rating: float = 0.0
    reviews: int = 0
    trending: bool = False
    is_public: bool = True
    uploaded_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BookCreate(BaseModel):
    title: str
    author: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    language: str = "pt"
    category: str = "fiction"
    total_pages: int = 0
    total_chapters: int = 0
    is_public: bool = True

class ReadingProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    book_id: str
    current_page: int = 1
    current_chapter: int = 1
    percentage_complete: float = 0.0
    last_position: str = ""
    total_reading_time: int = 0
    is_finished: bool = False
    last_read_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReadingProgressUpdate(BaseModel):
    current_page: Optional[int] = None
    current_chapter: Optional[int] = None
    percentage_complete: Optional[float] = None
    last_position: Optional[str] = None
    total_reading_time: Optional[int] = None
    is_finished: Optional[bool] = None

class Bookmark(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    book_id: str
    position: str
    chapter: Optional[int] = None
    page_number: Optional[int] = None
    note: Optional[str] = None
    color: str = "#FFEB3B"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BookmarkCreate(BaseModel):
    book_id: str
    position: str
    chapter: Optional[int] = None
    page_number: Optional[int] = None
    note: Optional[str] = None
    color: str = "#FFEB3B"

class Annotation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    book_id: str
    highlighted_text: str
    position_start: Optional[str] = None
    position_end: Optional[str] = None
    note: Optional[str] = None
    color: str = "#FFEB3B"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AnnotationCreate(BaseModel):
    book_id: str
    highlighted_text: str
    position_start: Optional[str] = None
    position_end: Optional[str] = None
    note: Optional[str] = None
    color: str = "#FFEB3B"

class ReadingPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    theme: str = "soft-beige"
    font_family: str = "Merriweather"
    font_size: int = 16
    line_spacing: float = 1.5
    margin_size: str = "medium"
    brightness: int = 100
    auto_night_mode: bool = True
    page_turn_animation: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    font_family: Optional[str] = None
    font_size: Optional[int] = None
    line_spacing: Optional[float] = None
    margin_size: Optional[str] = None
    brightness: Optional[int] = None
    auto_night_mode: Optional[bool] = None
    page_turn_animation: Optional[bool] = None

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"$or": [{"email": user_data.email}, {"username": user_data.username}]}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already exists")
    
    # Create user
    user = User(email=user_data.email, username=user_data.username)
    user_doc = user.model_dump()
    user_doc["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(user_doc)
    
    # Create default preferences
    prefs = ReadingPreferences(user_id=user.id)
    await db.reading_preferences.insert_one(prefs.model_dump())
    
    # Generate token
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**user_doc)
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============ BOOK ROUTES ============

@api_router.post("/books", response_model=Book)
async def create_book(
    title: str = Form(...),
    author: str = Form(...),
    description: Optional[str] = Form(None),
    cover_url: Optional[str] = Form(None),
    category: str = Form("fiction"),
    language: str = Form("pt"),
    total_pages: int = Form(0),
    total_chapters: int = Form(0),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Save file
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["pdf", "epub", "txt"]:
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}.{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size = file_path.stat().st_size
    
    # Create book with random rating and reviews
    book = Book(
        title=title,
        author=author,
        description=description,
        cover_url=cover_url,
        category=category,
        file_url=f"/uploads/{file_id}.{file_extension}",
        file_format=file_extension,
        file_size=file_size,
        language=language,
        total_pages=total_pages,
        total_chapters=total_chapters,
        rating=round(random.uniform(3.5, 5.0), 1),
        reviews=random.randint(10, 500),
        trending=random.choice([True, False]),
        uploaded_by=current_user.id
    )
    
    await db.books.insert_one(book.model_dump())
    return book

@api_router.get("/books", response_model=List[Book])
async def get_books(current_user: User = Depends(get_current_user)):
    books = await db.books.find({"$or": [{"is_public": True}, {"uploaded_by": current_user.id}]}, {"_id": 0}).to_list(1000)
    return books

@api_router.get("/books/{book_id}", response_model=Book)
async def get_book(book_id: str, current_user: User = Depends(get_current_user)):
    book = await db.books.find_one({"id": book_id}, {"_id": 0})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return Book(**book)

@api_router.delete("/books/{book_id}")
async def delete_book(book_id: str, current_user: User = Depends(get_current_user)):
    book = await db.books.find_one({"id": book_id}, {"_id": 0})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book["uploaded_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.books.delete_one({"id": book_id})
    return {"message": "Book deleted"}

# ============ READING PROGRESS ROUTES ============

@api_router.get("/reading/progress/{book_id}", response_model=ReadingProgress)
async def get_reading_progress(book_id: str, current_user: User = Depends(get_current_user)):
    progress = await db.reading_progress.find_one({"user_id": current_user.id, "book_id": book_id}, {"_id": 0})
    if not progress:
        new_progress = ReadingProgress(user_id=current_user.id, book_id=book_id)
        await db.reading_progress.insert_one(new_progress.model_dump())
        return new_progress
    else:
        return ReadingProgress(**progress)

@api_router.put("/reading/progress/{book_id}", response_model=ReadingProgress)
async def update_reading_progress(
    book_id: str,
    update: ReadingProgressUpdate,
    current_user: User = Depends(get_current_user)
):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["last_read_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.reading_progress.update_one(
        {"user_id": current_user.id, "book_id": book_id},
        {"$set": update_data},
        upsert=True
    )
    
    updated = await db.reading_progress.find_one({"user_id": current_user.id, "book_id": book_id}, {"_id": 0})
    return ReadingProgress(**updated)

# ============ BOOKMARK ROUTES ============

@api_router.post("/bookmarks", response_model=Bookmark)
async def create_bookmark(bookmark_data: BookmarkCreate, current_user: User = Depends(get_current_user)):
    bookmark = Bookmark(user_id=current_user.id, **bookmark_data.model_dump())
    await db.bookmarks.insert_one(bookmark.model_dump())
    return bookmark

@api_router.get("/bookmarks/{book_id}", response_model=List[Bookmark])
async def get_bookmarks(book_id: str, current_user: User = Depends(get_current_user)):
    bookmarks = await db.bookmarks.find({"user_id": current_user.id, "book_id": book_id}, {"_id": 0}).to_list(1000)
    return bookmarks

@api_router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, current_user: User = Depends(get_current_user)):
    result = await db.bookmarks.delete_one({"id": bookmark_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"message": "Bookmark deleted"}

# ============ ANNOTATION ROUTES ============

@api_router.post("/annotations", response_model=Annotation)
async def create_annotation(annotation_data: AnnotationCreate, current_user: User = Depends(get_current_user)):
    annotation = Annotation(user_id=current_user.id, **annotation_data.model_dump())
    await db.annotations.insert_one(annotation.model_dump())
    return annotation

@api_router.get("/annotations/{book_id}", response_model=List[Annotation])
async def get_annotations(book_id: str, current_user: User = Depends(get_current_user)):
    annotations = await db.annotations.find({"user_id": current_user.id, "book_id": book_id}, {"_id": 0}).to_list(1000)
    return annotations

@api_router.delete("/annotations/{annotation_id}")
async def delete_annotation(annotation_id: str, current_user: User = Depends(get_current_user)):
    result = await db.annotations.delete_one({"id": annotation_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return {"message": "Annotation deleted"}

# ============ PREFERENCES ROUTES ============

@api_router.get("/preferences", response_model=ReadingPreferences)
async def get_preferences(current_user: User = Depends(get_current_user)):
    prefs = await db.reading_preferences.find_one({"user_id": current_user.id}, {"_id": 0})
    if not prefs:
        prefs = ReadingPreferences(user_id=current_user.id)
        await db.reading_preferences.insert_one(prefs.model_dump())
    return ReadingPreferences(**prefs)

@api_router.put("/preferences", response_model=ReadingPreferences)
async def update_preferences(update: PreferencesUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    await db.reading_preferences.update_one(
        {"user_id": current_user.id},
        {"$set": update_data},
        upsert=True
    )
    
    prefs = await db.reading_preferences.find_one({"user_id": current_user.id}, {"_id": 0})
    return ReadingPreferences(**prefs)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
