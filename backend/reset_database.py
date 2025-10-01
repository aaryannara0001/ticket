#!/usr/bin/env python3
"""
Script to properly initialize the database with the correct schema.
This fixes the database schema mismatch issues.
"""

from app.core.security import get_password_hash
from app.database.models import Base, User, UserRole, Department
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def reset_and_initialize_database(database_url: str = "sqlite:///./ticketing_system.db"):
    """Reset and initialize the database with correct schema."""
    print("🔄 Resetting and initializing database...")
    print(f"📊 Database: {database_url}")

    # Remove existing database file
    db_path = database_url.replace("sqlite:///./", "")
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"🗑️  Removed existing database: {db_path}")

    # Create engine
    engine = create_engine(database_url, echo=False)

    # Create all tables with correct schema
    print("📋 Creating database tables...")
    Base.metadata.drop_all(bind=engine)  # Ensure clean slate
    Base.metadata.create_all(bind=engine)
    print("✅ Created database tables with correct schema")

    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Create default admin user
        print("👤 Creating default admin user...")
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
        print("✅ Created admin user: admin@company.com / password")

        # Create default departments
        print("🏢 Creating default departments...")
        default_departments = [
            {"name": "Engineering",
                "description": "Software development and technical issues"},
            {"name": "Support", "description": "Customer support and help desk"},
            {"name": "Sales", "description": "Sales and business development"},
            {"name": "Marketing", "description": "Marketing and communications"},
            {"name": "HR", "description": "Human resources and people operations"},
            {"name": "Finance", "description": "Finance and accounting"},
            {"name": "Operations", "description": "Operations and infrastructure"}
        ]

        for dept_data in default_departments:
            department = Department(
                name=dept_data["name"],
                description=dept_data["description"],
                active=True
            )
            db.add(department)

        db.commit()
        print("✅ Created default departments")

        # Create sample users for testing
        print("👥 Creating sample users...")
        sample_users = [
            {"name": "John Developer", "email": "john.dev@company.com",
                "role": UserRole.DEVELOPER},
            {"name": "Sarah Manager", "email": "sarah.manager@company.com",
                "role": UserRole.MANAGER},
            {"name": "Mike Support", "email": "mike.support@company.com",
                "role": UserRole.SUPPORT},
            {"name": "Lisa IT Specialist",
                "email": "lisa.it@company.com", "role": UserRole.IT},
            {"name": "David Client", "email": "david.client@company.com",
                "role": UserRole.CLIENT},
            {"name": "Emma Developer", "email": "emma.dev@company.com",
                "role": UserRole.DEVELOPER},
            {"name": "Tom Manager", "email": "tom.manager@company.com",
                "role": UserRole.MANAGER}
        ]

        for user_data in sample_users:
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=get_password_hash("password123"),
                role=user_data["role"],
                active=True,
                email_verified=True
            )
            db.add(user)

        db.commit()
        print(f"✅ Created {len(sample_users)} sample users")

        # Verify database structure
        print("\n🔍 Verifying database structure...")
        with engine.connect() as conn:
            # Check users table columns
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            print(f"   Users table columns: {', '.join(columns)}")

            # Count users
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            print(f"   Total users: {user_count}")

            # Count departments
            result = conn.execute(text("SELECT COUNT(*) FROM departments"))
            dept_count = result.scalar()
            print(f"   Total departments: {dept_count}")

        print("\n✅ Database initialization completed successfully!")

    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        db.rollback()
        return False
    finally:
        db.close()

    return True


def main():
    """Main function."""
    print("🎫 Ticketing System - Database Reset & Initialization")
    print("=" * 60)

    success = reset_and_initialize_database()

    if success:
        print("\n🎉 Database initialization completed successfully!")
        print("💡 You can now start the server and login with:")
        print("   📧 Email: admin@company.com")
        print("   🔑 Password: password")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
