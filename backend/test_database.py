#!/usr/bin/env python3
"""Test database integration."""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.setup import setup_database

def test_database_setup():
    """Test database setup with SQLite."""
    print("🧪 Testing database setup...")
    
    # Setup database with SQLite
    db_url = "sqlite:///./test_ticketing.db"
    setup_database(db_url)
    
    print("✅ Database setup test completed!")
    
    # Clean up test database
    if os.path.exists("./test_ticketing.db"):
        os.remove("./test_ticketing.db")
        print("🧹 Cleaned up test database")

if __name__ == "__main__":
    test_database_setup()