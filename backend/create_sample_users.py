#!/usr/bin/env python3
"""
Script to create sample users for testing the project creation modal.
"""

from app.core.security import get_password_hash
from app.database.models import User, UserRole
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def create_sample_users(database_url: str = "sqlite:///./ticketing_system.db"):
    """Create sample users for testing."""
    print("👥 Creating sample users for testing...")

    # Create engine and session
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    # Sample users data
    sample_users = [
        {
            "name": "John Developer",
            "email": "john.dev@company.com",
            "role": UserRole.DEVELOPER,
            "password": "password123"
        },
        {
            "name": "Sarah Manager",
            "email": "sarah.manager@company.com",
            "role": UserRole.MANAGER,
            "password": "password123"
        },
        {
            "name": "Mike Support",
            "email": "mike.support@company.com",
            "role": UserRole.SUPPORT,
            "password": "password123"
        },
        {
            "name": "Lisa IT Specialist",
            "email": "lisa.it@company.com",
            "role": UserRole.IT,
            "password": "password123"
        },
        {
            "name": "David Client",
            "email": "david.client@company.com",
            "role": UserRole.CLIENT,
            "password": "password123"
        },
        {
            "name": "Emma Developer",
            "email": "emma.dev@company.com",
            "role": UserRole.DEVELOPER,
            "password": "password123"
        },
        {
            "name": "Tom Manager",
            "email": "tom.manager@company.com",
            "role": UserRole.MANAGER,
            "password": "password123"
        }
    ]

    created_count = 0
    existing_count = 0

    try:
        for user_data in sample_users:
            # Check if user already exists
            existing_user = db.query(User).filter(
                User.email == user_data["email"]).first()

            if not existing_user:
                # Create new user
                new_user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    password_hash=get_password_hash(user_data["password"]),
                    role=user_data["role"],
                    active=True,
                    email_verified=True
                )
                db.add(new_user)
                created_count += 1
                print(
                    f"  ✅ Created: {user_data['name']} ({user_data['email']}) - {user_data['role'].value}")
            else:
                existing_count += 1
                print(
                    f"  ℹ️  Exists: {user_data['name']} ({user_data['email']}) - {user_data['role'].value}")

        db.commit()

        print(f"\n📊 Summary:")
        print(f"  👥 Created: {created_count} new users")
        print(f"  ♻️  Existing: {existing_count} users")
        print(f"  📝 Total sample users: {len(sample_users)}")

        # Display all users
        all_users = db.query(User).all()
        print(f"\n👥 All Users in Database ({len(all_users)} total):")
        for user in all_users:
            status = "🔒 PERMANENT" if user.email == "admin@company.com" else "👤 Regular"
            print(f"  {status} - {user.name} ({user.email}) - {user.role.value}")

        print(f"\n✅ Sample users setup completed!")
        print(f"💡 Default password for all sample users: password123")

    except Exception as e:
        print(f"❌ Error creating sample users: {e}")
        return False
    finally:
        db.close()

    return True


def main():
    """Main function."""
    print("🎫 Ticketing System - Sample Users Setup")
    print("=" * 50)

    success = create_sample_users()

    if success:
        print("\n🎉 Sample users setup completed successfully!")
    else:
        print("\n❌ Sample users setup failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
