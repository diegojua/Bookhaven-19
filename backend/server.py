from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from supabase import create_client, Client
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
import tempfile
import random

# Remove ROOT_DIR/UPLOAD_DIR usage if no longer needed for static serving, 
# but ROOT_DIR is used for .env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


# Supabase connection
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# File upload
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# Supabase Storage Bucket - User must create this manually if it doesn't exist
STORAGE_BUCKET = "uploads"

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
        
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_data = response.data[0]
        return User(**user_data)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    try:
        # Check email
        res_email = supabase.table("users").select("id").eq("email", user_data.email).execute()
        if res_email.data:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Check username
        res_user = supabase.table("users").select("id").eq("username", user_data.username).execute()
        if res_user.data:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Create user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(user_data.password)
        
        new_user = {
            "id": user_id,
            "email": user_data.email,
            "username": user_data.username,
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table("users").insert(new_user).execute()
        
        # Create default preferences
        prefs = {
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        supabase.table("reading_preferences").insert(prefs).execute()
        
        user = User(**new_user)
        token = create_access_token(user.id)
        return Token(access_token=token, token_type="bearer", user=user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    try:
        response = supabase.table("users").select("*").eq("email", credentials.email).execute()
        if not response.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_doc = response.data[0]
        if not verify_password(credentials.password, user_doc["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user = User(**user_doc)
        token = create_access_token(user.id)
        return Token(access_token=token, token_type="bearer", user=user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

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
    # Save file to Supabase Storage
    path = f"{file_id}.{file_extension}"
    
    try:
        # Upload
        file_bytes = await file.read()
        res = supabase.storage.from_(STORAGE_BUCKET).upload(
            path=path,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
        # file_url is usually just the path if we use from_().get_public_url()
        # but we need to store the relative path for our download logic or full URL
        # Storing relative path is flexible.
        storage_path = path 
        
        # Get public URL for frontend display
        public_url_res = supabase.storage.from_(STORAGE_BUCKET).get_public_url(path)
        # public_url_res is just a string URL
        
        file_size = len(file_bytes)
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Error uploading file to storage")
    
    # Create book
    book_data = {
        "id": str(uuid.uuid4()),
        "title": title,
        "author": author,
        "description": description,
        "cover_url": cover_url,
        "category": category,
        "cover_url": cover_url,
        "category": category,
        "file_url": storage_path, # Storing just the filename/path in bucket
        "file_format": file_extension,
        "file_format": file_extension,
        "file_size": file_size,
        "language": language,
        "total_pages": total_pages,
        "total_chapters": total_chapters,
        "rating": round(random.uniform(3.5, 5.0), 1),
        "reviews": random.randint(10, 500),
        "trending": random.choice([True, False]),
        "uploaded_by": current_user.id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        supabase.table("books").insert(book_data).execute()
        return Book(**book_data)
    except Exception as e:
        logger.error(f"Create book error: {e}")
        raise HTTPException(status_code=500, detail="Error creating book")

@api_router.get("/books", response_model=List[Book])
async def get_books(current_user: User = Depends(get_current_user)):
    try:
        # Get public books OR books uploaded by user
        response = supabase.table("books").select("*").or_(f"is_public.eq.true,uploaded_by.eq.{current_user.id}").execute()
        return [Book(**book) for book in response.data]
    except Exception as e:
        logger.error(f"Get books error: {e}")
        return []

@api_router.get("/books/{book_id}", response_model=Book)
async def get_book(book_id: str, current_user: User = Depends(get_current_user)):
    try:
        response = supabase.table("books").select("*").eq("id", book_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Book not found")
        return Book(**response.data[0])
    except Exception as e:
        logger.error(f"Get book error: {e}")
        raise HTTPException(status_code=404, detail="Book not found")

@api_router.delete("/books/{book_id}")
async def delete_book(book_id: str, current_user: User = Depends(get_current_user)):
    try:
        # Check ownership
        response = supabase.table("books").select("uploaded_by").eq("id", book_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Book not found")
        
        if response.data[0]["uploaded_by"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Delete from storage first
        try:
             # Retrieve file_url (which we stored as path)
             book = response.data[0]
             file_path_in_bucket = book["file_url"]
             supabase.storage.from_(STORAGE_BUCKET).remove([file_path_in_bucket])
        except Exception as storage_err:
             logger.warning(f"Storage delete error: {storage_err}")

        supabase.table("books").delete().eq("id", book_id).execute()
        return {"message": "Book deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete book error: {e}")
        raise HTTPException(status_code=500, detail="Error deleting book")

# ============ READING PROGRESS ROUTES ============

@api_router.get("/reading/progress/{book_id}", response_model=ReadingProgress)
async def get_reading_progress(book_id: str, current_user: User = Depends(get_current_user)):
    try:
        response = supabase.table("reading_progress").select("*").eq("user_id", current_user.id).eq("book_id", book_id).execute()
        
        if not response.data:
            new_progress = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "book_id": book_id,
                "last_read_at": datetime.now(timezone.utc).isoformat()
            }
            supabase.table("reading_progress").insert(new_progress).execute()
            return ReadingProgress(**new_progress)
        
        return ReadingProgress(**response.data[0])
    except Exception as e:
        logger.error(f"Get progress error: {e}")
        raise HTTPException(status_code=500, detail="Error fetching progress")

@api_router.put("/reading/progress/{book_id}", response_model=ReadingProgress)
async def update_reading_progress(
    book_id: str,
    update: ReadingProgressUpdate,
    current_user: User = Depends(get_current_user)
):
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        update_data["last_read_at"] = datetime.now(timezone.utc).isoformat()
        
        # Check if exists
        check = supabase.table("reading_progress").select("id").eq("user_id", current_user.id).eq("book_id", book_id).execute()
        
        if check.data:
            supabase.table("reading_progress").update(update_data).eq("user_id", current_user.id).eq("book_id", book_id).execute()
        else:
            update_data["user_id"] = current_user.id
            update_data["book_id"] = book_id
            supabase.table("reading_progress").insert(update_data).execute()
        
        updated = supabase.table("reading_progress").select("*").eq("user_id", current_user.id).eq("book_id", book_id).execute()
        return ReadingProgress(**updated.data[0])
    except Exception as e:
        logger.error(f"Update progress error: {e}")
        raise HTTPException(status_code=500, detail="Error updating progress")

# ============ BOOKMARK ROUTES ============

@api_router.post("/bookmarks", response_model=Bookmark)
async def create_bookmark(bookmark_data: BookmarkCreate, current_user: User = Depends(get_current_user)):
    try:
        new_bookmark = bookmark_data.model_dump()
        new_bookmark["user_id"] = current_user.id
        new_bookmark["id"] = str(uuid.uuid4())
        new_bookmark["created_at"] = datetime.now(timezone.utc).isoformat()
        
        supabase.table("bookmarks").insert(new_bookmark).execute()
        return Bookmark(**new_bookmark)
    except Exception as e:
        logger.error(f"Create bookmark error: {e}")
        raise HTTPException(status_code=500, detail="Error creating bookmark")

@api_router.get("/bookmarks/{book_id}", response_model=List[Bookmark])
async def get_bookmarks(book_id: str, current_user: User = Depends(get_current_user)):
    try:
        response = supabase.table("bookmarks").select("*").eq("user_id", current_user.id).eq("book_id", book_id).execute()
        return [Bookmark(**b) for b in response.data]
    except Exception as e:
        logger.error(f"Get bookmarks error: {e}")
        return []

@api_router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, current_user: User = Depends(get_current_user)):
    try:
        response = supabase.table("bookmarks").delete().eq("id", bookmark_id).eq("user_id", current_user.id).execute()
        if not response.data:
             # Supabase delete returns data of deleted rows. If empty, nothing was deleted.
             # However, sometimes it might be empty if return representation is off. 
             # Assuming standard behavior, if we want to be strict we'd check first.
             pass 
        return {"message": "Bookmark deleted"}
    except Exception as e:
        logger.error(f"Delete bookmark error: {e}")
        raise HTTPException(status_code=500, detail="Error deleting bookmark")

# ============ ANNOTATION ROUTES ============

@api_router.post("/annotations", response_model=Annotation)
async def create_annotation(annotation_data: AnnotationCreate, current_user: User = Depends(get_current_user)):
    try:
        new_annotation = annotation_data.model_dump()
        new_annotation["user_id"] = current_user.id
        new_annotation["id"] = str(uuid.uuid4())
        new_annotation["created_at"] = datetime.now(timezone.utc).isoformat()
        
        supabase.table("annotations").insert(new_annotation).execute()
        return Annotation(**new_annotation)
    except Exception as e:
        logger.error(f"Create annotation error: {e}")
        raise HTTPException(status_code=500, detail="Error creating annotation")

@api_router.get("/annotations/{book_id}", response_model=List[Annotation])
async def get_annotations(book_id: str, current_user: User = Depends(get_current_user)):
    try:
        response = supabase.table("annotations").select("*").eq("user_id", current_user.id).eq("book_id", book_id).execute()
        return [Annotation(**a) for a in response.data]
    except Exception as e:
        logger.error(f"Get annotations error: {e}")
        return []

@api_router.delete("/annotations/{annotation_id}")
async def delete_annotation(annotation_id: str, current_user: User = Depends(get_current_user)):
    try:
        supabase.table("annotations").delete().eq("id", annotation_id).eq("user_id", current_user.id).execute()
        return {"message": "Annotation deleted"}
    except Exception as e:
        logger.error(f"Delete annotation error: {e}")
        raise HTTPException(status_code=500, detail="Error deleting annotation")

# ============ PREFERENCES ROUTES ============

@api_router.get("/preferences", response_model=ReadingPreferences)
async def get_preferences(current_user: User = Depends(get_current_user)):
    try:
        response = supabase.table("reading_preferences").select("*").eq("user_id", current_user.id).execute()
        
        if not response.data:
            prefs = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            supabase.table("reading_preferences").insert(prefs).execute()
            return ReadingPreferences(**prefs)
        
        return ReadingPreferences(**response.data[0])
    except Exception as e:
        logger.error(f"Get preferences error: {e}")
        raise HTTPException(status_code=500, detail="Error fetching preferences")

@api_router.put("/preferences", response_model=ReadingPreferences)
async def update_preferences(update: PreferencesUpdate, current_user: User = Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        
        # Check if exists
        check = supabase.table("reading_preferences").select("id").eq("user_id", current_user.id).execute()
        
        if check.data:
            supabase.table("reading_preferences").update(update_data).eq("user_id", current_user.id).execute()
        else:
            update_data["user_id"] = current_user.id
            supabase.table("reading_preferences").insert(update_data).execute()
            
        updated = supabase.table("reading_preferences").select("*").eq("user_id", current_user.id).execute()
        return ReadingPreferences(**updated.data[0])
    except Exception as e:
        logger.error(f"Update preferences error: {e}")
        raise HTTPException(status_code=500, detail="Error updating preferences")

import pypdf
import base64

@api_router.get("/books/{book_id}/extract-text")
async def extract_book_text(book_id: str):
    try:
        # Get book info
        response = supabase.table("books").select("*").eq("id", book_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Book not found")
        
        book = response.data[0]
        # file_url is the path in bucket
        file_path_in_bucket = book["file_url"]
        
        # Download to temp file
        try:
            # Download bytes
            res = supabase.storage.from_(STORAGE_BUCKET).download(file_path_in_bucket)
            # res is bytes
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{book['file_format']}") as tmp_file:
                tmp_file.write(res)
                tmp_path = Path(tmp_file.name)
                
            content_data = []
            
            try:
                if book["file_format"] == "pdf":
                    reader = pypdf.PdfReader(str(tmp_path))
                    for i, page in enumerate(reader.pages):
                        page_text = page.extract_text()
                        page_images = []
                        
                        try:
                            for image_file in page.images:
                                base64_str = base64.b64encode(image_file.data).decode('utf-8')
                                mime_type = "image/jpeg"
                                if image_file.name.lower().endswith('.png'):
                                    mime_type = "image/png"
                                elif image_file.name.lower().endswith('.webp'):
                                    mime_type = "image/webp"
                                page_images.append(f"data:{mime_type};base64,{base64_str}")
                        except Exception:
                            pass # Ignore image errors
                            
                        content_data.append({
                            "page": i + 1,
                            "text": page_text,
                            "images": page_images
                        })
                        
                elif book["file_format"] == "txt":
                    with open(tmp_path, "rb") as f:
                        raw = f.read()
                        try:
                            text = raw.decode("utf-8")
                        except UnicodeDecodeError:
                            text = raw.decode("latin-1")
                            
                    content_data.append({
                        "page": 1,
                        "text": text,
                        "images": []
                    })
            finally:
                # Cleanup temp file
                if tmp_path.exists():
                     os.unlink(tmp_path)
                     
        except Exception as e:
            logger.error(f"Download/Process error: {e}")
            raise HTTPException(status_code=500, detail="Error processing file from storage")

        return {"pages": content_data}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Extract text error: {e}")
        raise HTTPException(status_code=500, detail="Error extracting content")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ] + os.environ.get('CORS_ORIGINS', '').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Remove static mount for uploads since we use Supabase now, 
# but keep it in case someone really wants local for testing if configured differently (omitted here for cleanliness)
# app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
