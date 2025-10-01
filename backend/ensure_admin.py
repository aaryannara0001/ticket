#!/usr/bin/env python3
"""
Script to ensure admin@company.com exists as a permanent admin user.
This script can be run anytime to verify/create the admin user.
"""

from app.core.security import get_password_hash
from app.database.models import User, UserRole
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def ensure_admin_user(database_url: str = "sqlite:///./ticketing_system.db"):
    """Ensure admin@company.com exists as a permanent admin user."""
    print("🔐 Ensuring permanent admin user exists...")
    print(f"📊 Database: {database_url}")

    # Create engine and session
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Check for admin user
        admin_user = db.query(User).filter(
            User.email == "admin@company.com").first()

        if not admin_user:
            # Create new admin user
            print("👤 Creating new admin user...")
            admin_user = User(
                name="Admin User",
                email="admin@company.com",
                password_hash=get_password_hash("password"),
                role=UserRole.ADMIN,
                active=True,
                email_verified=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Created permanent admin user: admin@company.com")
            print("🔑 Default password: password")
        else:
            # Ensure admin user has correct settings
            print("👤 Found existing admin user, verifying settings...")
            updated = False

            # Ensure correct password hash
            correct_hash = get_password_hash("password")
            if admin_user.password_hash != correct_hash:
                admin_user.password_hash = correct_hash
                updated = True
                print("🔑 Updated password hash")

            # Ensure active
            if not admin_user.active:
                admin_user.active = True
                updated = True
                print("✅ Activated user")

            # Ensure email verified
            if not admin_user.email_verified:
                admin_user.email_verified = True
                updated = True
                print("📧 Verified email")

            # Ensure admin role
            if admin_user.role != UserRole.ADMIN:
                admin_user.role = UserRole.ADMIN
                updated = True
                print("👑 Set admin role")

            if updated:
                db.commit()
                print("✅ Updated admin user settings")
            else:
                print("✅ Admin user is already properly configured")

        # Display admin info
        admin_user = db.query(User).filter(
            User.email == "admin@company.com").first()
        print("\n📋 Admin User Status:")
        print(f"   📧 Email: {admin_user.email}")
        print(f"   👤 Name: {admin_user.name}")
        print(f"   👑 Role: {admin_user.role.value}")
        print(f"   ✅ Active: {admin_user.active}")
        print(f"   📧 Email Verified: {admin_user.email_verified}")
        print(f"   🆔 ID: {admin_user.id}")
        print(f"   🔑 Default Password: password")

        print("\n🔒 Protection Features:")
        print("   • Cannot be deleted")
        print("   • Cannot have admin role removed")
        print("   • Cannot be deactivated")
        print("   • Cannot have email changed")
        print("   • Always verified on startup")

        print("\n✅ Permanent admin user is ready!")

    except Exception as e:
        print(f"❌ Error ensuring admin user: {e}")
        return False
    finally:
        db.close()

    return True


def main():
    """Main function."""
    print("🎫 Ticketing System - Admin User Setup")
    print("=" * 50)

    # Check if custom database URL is provided
    database_url = "sqlite:///./ticketing_system.db"
    if len(sys.argv) > 1:
        database_url = sys.argv[1]

    success = ensure_admin_user(database_url)

    if success:
        print("\n🎉 Admin setup completed successfully!")
        print("💡 You can now login with: admin@company.com / password")
    else:
        print("\n❌ Admin setup failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
