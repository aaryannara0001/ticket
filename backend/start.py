#!/usr/bin/env python3
"""Simple startup script for the ticketing system backend."""

import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🎫 Starting Ticketing System Backend...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔐 Default Admin: admin@company.com / password")
    print("🚀 Server starting on http://localhost:8000")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )