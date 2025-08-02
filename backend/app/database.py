"""
Database connection and initialization module.

This module handles the connection to Supabase and provides
database utilities for the application.
"""

import asyncio
from typing import Optional
from supabase import create_client, Client
from app.config import settings

# Global Supabase client
supabase: Optional[Client] = None

async def init_db():
    """Initialize the database connection."""
    global supabase
    
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("✅ Database connection initialized successfully")
        return supabase
    except Exception as e:
        print(f"❌ Failed to initialize database connection: {e}")
        raise

def get_supabase() -> Client:
    """Get the Supabase client instance."""
    if supabase is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return supabase

async def test_connection():
    """Test the database connection."""
    try:
        client = get_supabase()
        # Try a simple query to test connection
        result = client.table("banks").select("id").limit(1).execute()
        print("✅ Database connection test successful")
        return True
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False