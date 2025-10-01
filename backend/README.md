# Ticketing System Backend

A FastAPI-based backend for the ticketing system with role-based access control, JWT authentication, and in-memory storage.

## Features

- **Authentication**: JWT-based auth with access/refresh tokens
- **Role-based Access Control**: User, Manager, Admin roles
- **Ticket Management**: CRUD operations with status lifecycle validation
- **Project Management**: Project creation and management
- **Workflow Automation**: Rule-based workflow engine (stubbed)
- **Reports & Analytics**: Dashboard stats and reports
- **File Attachments**: Presigned URL generation (stubbed for S3)

## Quick Start

### Prerequisites

- Python 3.11+
- pip

### Installation

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Default Admin User

The system creates a default admin user for testing:
- Email: `admin@company.com`
- Password: `password`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/` - Get all users (admin only)
- `POST /api/v1/users/` - Create user (admin only)
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user (admin only)

### Tickets
- `GET /api/v1/tickets/` - Get all tickets (with filters)
- `POST /api/v1/tickets/` - Create ticket
- `GET /api/v1/tickets/my` - Get current user's tickets
- `GET /api/v1/tickets/{ticket_id}` - Get ticket by ID
- `PUT /api/v1/tickets/{ticket_id}` - Update ticket
- `GET /api/v1/tickets/{ticket_id}/history` - Get ticket history
- `GET /api/v1/tickets/key/{ticket_key}` - Get ticket by key

### Projects
- `GET /api/v1/projects/` - Get all projects
- `POST /api/v1/projects/` - Create project (manager/admin only)
- `GET /api/v1/projects/{project_id}` - Get project by ID
- `PUT /api/v1/projects/{project_id}` - Update project (manager/admin only)
- `DELETE /api/v1/projects/{project_id}` - Delete project (manager/admin only)

### Attachments
- `POST /api/v1/attachments/presigned-url` - Get presigned URL for upload
- `POST /api/v1/attachments/` - Create attachment record
- `GET /api/v1/attachments/{attachment_id}` - Get attachment
- `GET /api/v1/attachments/ticket/{ticket_id}` - Get ticket attachments
- `DELETE /api/v1/attachments/{attachment_id}` - Delete attachment

### Workflows
- `GET /api/v1/workflows/` - Get workflow rules (admin only)
- `POST /api/v1/workflows/` - Create workflow rule (admin only)
- `GET /api/v1/workflows/{rule_id}` - Get workflow rule (admin only)
- `PUT /api/v1/workflows/{rule_id}` - Update workflow rule (admin only)
- `DELETE /api/v1/workflows/{rule_id}` - Delete workflow rule (admin only)

### Reports
- `GET /api/v1/reports/dashboard` - Get dashboard statistics
- `GET /api/v1/reports/tickets-by-status` - Tickets by status report (manager/admin)
- `GET /api/v1/reports/tickets-by-priority` - Tickets by priority report (manager/admin)
- `GET /api/v1/reports/tickets-by-department` - Tickets by department report (manager/admin)
- `GET /api/v1/reports/user-activity` - User activity report (manager/admin)

## Testing

Run the test suite:
```bash
pytest tests/ -v
```

The tests include:
- Authentication flow (login, register, token refresh)
- Ticket CRUD operations
- Status transition validation
- Complete integration workflow

## Architecture

### Models
- **User**: User accounts with roles (user, manager, admin)
- **Ticket**: Support tickets with status lifecycle
- **Project**: Project management
- **Attachment**: File attachments (S3 integration stubbed)
- **WorkflowRule**: Automation rules
- **Reports**: Dashboard and analytics data

### Services
- **AuthService**: Authentication and user session management
- **UserService**: User CRUD operations
- **TicketService**: Ticket management with history tracking
- **ProjectService**: Project management
- **AttachmentService**: File upload handling (stubbed)
- **WorkflowService**: Automation engine (stubbed)
- **ReportsService**: Analytics and reporting

### Security
- JWT tokens with RS256 algorithm
- Role-based access control
- Password hashing with bcrypt
- Token expiration (15min access, 30day refresh)

## Configuration

Environment variables (with defaults):
- `JWT_SECRET_KEY`: JWT signing key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration (15)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration (30)

## Status Transitions

Valid ticket status transitions:
- `open` → `in_progress`, `closed`
- `in_progress` → `open`, `closed`, `blocked`
- `blocked` → `in_progress`, `open`
- `closed` → `open`, `in_progress`

## Error Handling

All errors follow a consistent format:
```json
{
  "error": "E_ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```

## Next Steps

- Add PostgreSQL database integration
- Implement real S3 file uploads
- Add WebSocket support for real-time updates
- Implement email notifications
- Add comprehensive logging and monitoring
- Deploy with Docker containers