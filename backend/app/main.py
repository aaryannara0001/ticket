"""FastAPI application factory and main entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, users, tickets, projects, attachments, workflows, reports
from app.core.config import settings
from app.database.setup import setup_database


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("Starting up ticketing system API")
    # Setup database on startup
    setup_database()
    yield
    logger.info("Shutting down ticketing system API")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Ticketing System API",
        description="A comprehensive ticketing system with role-based access control",
        version="1.0.0",
        lifespan=lifespan
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add OPTIONS handler for all routes
    @app.options("/{path:path}")
    async def handle_options():
        return {"message": "OK"}

    # Include API routers
    app.include_router(auth.router, prefix="/api/v1/auth",
                       tags=["Authentication"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
    app.include_router(
        tickets.router, prefix="/api/v1/tickets", tags=["Tickets"])
    app.include_router(
        projects.router, prefix="/api/v1/projects", tags=["Projects"])
    app.include_router(attachments.router,
                       prefix="/api/v1/attachments", tags=["Attachments"])
    app.include_router(
        workflows.router, prefix="/api/v1/workflows", tags=["Workflows"])
    app.include_router(
        reports.router, prefix="/api/v1/reports", tags=["Reports"])

    # Add OPTIONS handlers for API routes after including routers
    @app.options("/api/v1/{path:path}")
    async def handle_api_options():
        return {"message": "OK"}

    @app.get("/")
    async def root():
        return {"message": "Ticketing System API", "version": "1.0.0"}

    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    return app


# Create app instance
app = create_app()
