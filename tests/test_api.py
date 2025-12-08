import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../backend"))

from server import app

client = TestClient(app)

# Mock Supabase client
@pytest.fixture
def mock_supabase():
    with patch("server.supabase") as mock:
        yield mock

def test_read_main():
    # The root endpoint is not defined in the snippet I saw, but /api/books is.
    # Let's check if there is a root endpoint.
    # Looking at server.py, there is no root "/" endpoint defined directly on `app`, only `api_router`.
    # But let's test a known endpoint like /api/books (unauthenticated might fail or return empty).
    # Actually /api/books requires authentication (Depends(get_current_user)).
    pass

def test_register_user(mock_supabase):
    # Mock the supabase response for email check (empty list = no user)
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    
    # Mock insert response
    mock_supabase.table.return_value.insert.return_value.execute.return_value = None

    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "password123"
        }
    )
    
    # If successful, it returns a token
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"

def test_login_user(mock_supabase):
    # Mock user data for login
    # We mock verify_password so the hash doesn't matter much, but let's keep it realistic-looking
    hashed_password = "hashed_password_example" 
    user_data = {
        "id": "123",
        "email": "test@example.com",
        "username": "testuser",
        "password_hash": hashed_password,
        "created_at": "2023-01-01T00:00:00Z"
    }

    # Mock response for email lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [user_data]

    # Patch verify_password
    with patch("server.verify_password", return_value=True):
        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_get_books_unauthorized():
    response = client.get("/api/books")
    assert response.status_code == 403 # HTTPBearer returns 403 if no header
