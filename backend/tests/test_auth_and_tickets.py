"""Test auth flow and ticket CRUD operations."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestAuthFlow:
    """Test authentication flow."""
    
    def test_login_with_default_admin(self):
        """Test login with default admin user."""
        response = client.post("/api/v1/auth/login", json={
            "email": "admin@company.com",
            "password": "password"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "accessToken" in data
        assert "refreshToken" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        
        return data["accessToken"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        response = client.post("/api/v1/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert data["detail"]["error"] == "E_AUTH_INVALID_CREDENTIALS"
    
    def test_register_new_user(self):
        """Test user registration."""
        response = client.post("/api/v1/auth/register", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpassword",
            "role": "user"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test User"
        assert data["email"] == "test@example.com"
        assert data["role"] == "user"
    
    def test_register_admin_forbidden(self):
        """Test that direct admin registration is forbidden."""
        response = client.post("/api/v1/auth/register", json={
            "name": "Admin User",
            "email": "admin2@example.com",
            "password": "adminpassword",
            "role": "admin"
        })
        
        assert response.status_code == 403
        data = response.json()
        assert data["detail"]["error"] == "E_AUTH_INSUFFICIENT_PERMISSIONS"


class TestTicketCRUD:
    """Test ticket CRUD operations."""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for testing."""
        response = client.post("/api/v1/auth/login", json={
            "email": "admin@company.com",
            "password": "password"
        })
        return response.json()["accessToken"]
    
    def test_create_ticket(self, auth_token):
        """Test ticket creation."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = client.post("/api/v1/tickets/", 
            headers=headers,
            json={
                "title": "Test Ticket",
                "description": "This is a test ticket",
                "priority": "medium",
                "department": "IT",
                "assigneeIds": []
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Ticket"
        assert data["status"] == "open"
        assert data["key"].startswith("TSK-")
        
        return data["id"]
    
    def test_get_tickets(self, auth_token):
        """Test getting all tickets."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = client.get("/api/v1/tickets/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_update_ticket_status(self, auth_token):
        """Test updating ticket status."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a ticket
        create_response = client.post("/api/v1/tickets/", 
            headers=headers,
            json={
                "title": "Status Test Ticket",
                "description": "Testing status updates",
                "priority": "high"
            }
        )
        ticket_id = create_response.json()["id"]
        
        # Update status from open to in_progress
        update_response = client.put(f"/api/v1/tickets/{ticket_id}",
            headers=headers,
            json={"status": "in_progress"}
        )
        
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["status"] == "in_progress"
        
        # Update status from in_progress to closed
        update_response = client.put(f"/api/v1/tickets/{ticket_id}",
            headers=headers,
            json={"status": "closed"}
        )
        
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["status"] == "closed"
    
    def test_invalid_status_transition(self, auth_token):
        """Test invalid status transition."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a ticket (starts as 'open')
        create_response = client.post("/api/v1/tickets/", 
            headers=headers,
            json={
                "title": "Invalid Transition Test",
                "description": "Testing invalid transitions",
                "priority": "low"
            }
        )
        ticket_id = create_response.json()["id"]
        
        # Try to transition from 'open' to 'blocked' (invalid)
        update_response = client.put(f"/api/v1/tickets/{ticket_id}",
            headers=headers,
            json={"status": "blocked"}
        )
        
        assert update_response.status_code == 400
        data = update_response.json()
        assert data["detail"]["error"] == "E_TICKET_INVALID_STATUS_TRANSITION"
    
    def test_get_ticket_history(self, auth_token):
        """Test getting ticket history."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create and update a ticket
        create_response = client.post("/api/v1/tickets/", 
            headers=headers,
            json={
                "title": "History Test Ticket",
                "description": "Testing history tracking"
            }
        )
        ticket_id = create_response.json()["id"]
        
        # Update the ticket
        client.put(f"/api/v1/tickets/{ticket_id}",
            headers=headers,
            json={"status": "in_progress"}
        )
        
        # Get history
        history_response = client.get(f"/api/v1/tickets/{ticket_id}/history",
            headers=headers
        )
        
        assert history_response.status_code == 200
        history = history_response.json()
        assert len(history) >= 2  # Created + status update
        assert any(entry["action"] == "created" for entry in history)
        assert any(entry["action"] == "updated_status" for entry in history)


class TestIntegrationFlow:
    """Test complete integration flow."""
    
    def test_complete_ticket_workflow(self):
        """Test complete workflow: login → create ticket → update status → fetch ticket."""
        # 1. Login
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@company.com",
            "password": "password"
        })
        assert login_response.status_code == 200
        token = login_response.json()["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Create ticket
        create_response = client.post("/api/v1/tickets/", 
            headers=headers,
            json={
                "title": "Integration Test Ticket",
                "description": "End-to-end workflow test",
                "priority": "critical",
                "department": "Engineering"
            }
        )
        assert create_response.status_code == 200
        ticket = create_response.json()
        ticket_id = ticket["id"]
        assert ticket["status"] == "open"
        
        # 3. Update status
        update_response = client.put(f"/api/v1/tickets/{ticket_id}",
            headers=headers,
            json={"status": "in_progress"}
        )
        assert update_response.status_code == 200
        updated_ticket = update_response.json()
        assert updated_ticket["status"] == "in_progress"
        
        # 4. Fetch ticket
        get_response = client.get(f"/api/v1/tickets/{ticket_id}", headers=headers)
        assert get_response.status_code == 200
        fetched_ticket = get_response.json()
        assert fetched_ticket["id"] == ticket_id
        assert fetched_ticket["status"] == "in_progress"
        assert fetched_ticket["title"] == "Integration Test Ticket"
        
        # 5. Get dashboard stats
        dashboard_response = client.get("/api/v1/reports/dashboard", headers=headers)
        assert dashboard_response.status_code == 200
        stats = dashboard_response.json()
        assert "openTickets" in stats
        assert "inProgressTickets" in stats
        assert stats["inProgressTickets"] >= 1  # At least our test ticket