import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not set")
    exit(1)

print(f"Connecting to {url}...")

try:
    supabase: Client = create_client(url, key)
    
    # Check Tables (public schema)
    print("\n--- Checking Tables ---")
    # This is a hacky way to list tables via postgrest if we don't have direct SQL access
    # We'll try to select from a known table 'users' or just print that we connected
    try:
        # Attempt to list buckets
        print("\n--- Checking Storage Buckets ---")
        res_buckets = supabase.storage.list_buckets()
        print(f"Buckets found: {len(res_buckets)}")
        for b in res_buckets:
            print(f" - {b.name}")
            
        if not any(b.name == 'uploads' for b in res_buckets):
            print("\nWARNING: 'uploads' bucket NOT found.")
        else:
            print("\nSUCCESS: 'uploads' bucket found.")
            
    except Exception as e:
        print(f"Error checking storage: {e}")

except Exception as e:
    print(f"Connection Failed: {e}")
