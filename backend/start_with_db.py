#!/usr/bin/env python3
"""Startup script that initializes database and starts the server."""

import sys
import os
import uvicorn

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.setup import setup_database

def main():
    """Initialize database and start server."""
    print("🎫 Starting Ticketing System Backend with Database...")
    print("=" * 50)
    
    # Initialize database
    try:
        print("🗄️  Initializing database...")
        setup_database()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️  Database initialization failed: {e}")
        print("🔄 Continuing with fallback configuration...")
    
    print("🚀 Starting FastAPI server...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔐 Default Admin: admin@company.com / password")
    print("-" * 50)
    
    # Start server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()