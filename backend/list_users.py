import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Missing credentials")
    exit(1)

supabase = create_client(url, key)

try:
    response = supabase.table("users").select("email,username").execute()
    print("Users found:")
    for user in response.data:
        print(f"Email: {user['email']}, Username: {user['username']}")
except Exception as e:
    print(f"Error: {e}")
