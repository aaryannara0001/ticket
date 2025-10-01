"""Database setup script that works with SQLite for development."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.models import Base, User, UserRole, Department
from app.core.security import get_password_hash


def setup_database(database_url: str = "sqlite:///./ticketing_system.db"):
    """Setup database with tables and initial data."""
    print(f"🗄️  Setting up database: {database_url}")

    # Create engine
    engine = create_engine(database_url, echo=True)

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Created database tables")

    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Create default admin user
        admin_user = db.query(User).filter(
            User.email == "admin@company.com").first()
        if not admin_user:
            admin_user = User(
                name="Admin User",
                email="admin@company.com",
                password_hash=get_password_hash("password"),
                role=UserRole.ADMIN,
                active=True,
                email_verified=True  # Always verified for permanent admin
            )
            db.add(admin_user)
            db.commit()
            print("✅ Created default admin user: admin@company.com / password")
        else:
            # Ensure admin user is always active, verified, and has admin role
            updated = False
            if not admin_user.active:
                admin_user.active = True
                updated = True
            if not admin_user.email_verified:
                admin_user.email_verified = True
                updated = True
            if admin_user.role != UserRole.ADMIN:
                admin_user.role = UserRole.ADMIN
                updated = True
            if updated:
                db.commit()
                print("✅ Updated admin user to ensure permanent admin status")
            print("ℹ️  Default admin user already exists and is properly configured")

        # Create default departments
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
            existing_dept = db.query(Department).filter(
                Department.name == dept_data["name"]
            ).first()

            if not existing_dept:
                department = Department(
                    name=dept_data["name"],
                    description=dept_data["description"],
                    active=True
                )
                db.add(department)

        db.commit()
        print("✅ Created default departments")
        print("✅ Database setup complete!")

    finally:
        db.close()


if __name__ == "__main__":
    setup_database()
