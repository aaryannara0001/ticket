"""Database initialization script."""

from sqlalchemy.orm import Session

from app.database.base import SessionLocal, engine
from app.database.models import Base, User, UserRole, Department
from app.core.security import get_password_hash
from app.core.config import settings


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


def create_default_admin(db: Session):
    """Create default admin user."""
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
        current_hash = get_password_hash("password")
        if admin_user.password_hash != current_hash:
            admin_user.password_hash = current_hash
            updated = True
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
            print(
                "✅ Updated admin user to ensure permanent admin status: admin@company.com / password")
        else:
            print("ℹ️  Default admin user already exists and is properly configured")


def create_default_departments(db: Session):
    """Create default departments."""
    default_departments = [
        {"name": "Developer", "description": "Software development and technical issues"},
        {"name": "Support", "description": "Customer support and help desk"},
        {"name": "IT", "description": "Information Technology infrastructure"},
        {"name": "Management", "description": "Management and administration"}
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


def init_database():
    """Initialize database with tables and default data."""
    print("🗄️  Initializing database...")

    # Create tables
    create_tables()
    print("✅ Created database tables")

    # Create default data
    db = SessionLocal()
    try:
        create_default_admin(db)
        create_default_departments(db)
        print("✅ Database initialization complete")
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
