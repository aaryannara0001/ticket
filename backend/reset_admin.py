#!/usr/bin/env python3
"""Script to reset admin password."""

from app.core.security import get_password_hash
from app.database.models import User
from app.database.base import SessionLocal
from sqlalchemy.orm import Session
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def reset_admin_password():
    """Reset admin password to use current hashing method."""
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(
            User.email == "admin@company.com").first()
        if admin_user:
            # Update password hash with current method
            admin_user.password_hash = get_password_hash("password")
            db.commit()
            print("✅ Reset admin password: admin@company.com / password")
        else:
            print("❌ Admin user not found")
    finally:
        db.close()


if __name__ == "__main__":
    reset_admin_password()
