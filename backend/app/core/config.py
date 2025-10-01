"""Application configuration settings."""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings with environment variable support."""

    # JWT Configuration
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5177",
        "http://127.0.0.1:5178",
        "http://127.0.0.1:5179",
        "http://127.0.0.1:5180"
    ]

    # Application Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Ticketing System"

    # Ticket Configuration
    TICKET_KEY_PREFIX: str = "TSK"
    TICKET_KEY_START: int = 1001

    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./ticketing_system.db"
    )

    # For testing, use SQLite
    TEST_DATABASE_URL: str = "sqlite:///./test.db"

    # Email/SMTP Configuration
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "nishunara862@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "brsvsncnxxzdfihy")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "nishunara862@gmail.com")
    FROM_NAME: str = os.getenv("FROM_NAME", "Ticket")


settings = Settings()
