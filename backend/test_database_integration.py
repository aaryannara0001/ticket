#!/usr/bin/env python3
"""Test database integration with FastAPI."""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_database_integration():
    """Test complete database integration with API."""
    print("🧪 Testing database integration with FastAPI...")
    
    client = TestClient(app)
    
    print("=" * 50)
    
    # Test health endpoint
    response = client.get("/health")
    print(f"✅ Health check: {response.status_code} - {response.json()}")
    
    # Test login with default admin
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@company.com",
        "password": "password"
    })
    print(f"✅ Login test: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   User: {data['user']['name']} ({data['user']['role']})")
        
        # Test creating a ticket with database
        token = data["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}
        
        ticket_response = client.post("/api/v1/tickets/", 
            headers=headers,
            json={
                "title": "Database Test Ticket",
                "description": "Testing database integration",
                "priority": "high",
                "department": "Engineering"
            }
        )
        print(f"✅ Create ticket: {ticket_response.status_code}")
        
        if ticket_response.status_code == 200:
            ticket = ticket_response.json()
            print(f"   Ticket: {ticket['key']} - {ticket['title']}")
            
            # Test updating ticket status
            update_response = client.put(f"/api/v1/tickets/{ticket['id']}",
                headers=headers,
                json={"status": "in_progress"}
            )
            print(f"✅ Update ticket: {update_response.status_code}")
            
            if update_response.status_code == 200:
                updated_ticket = update_response.json()
                print(f"   Status: {updated_ticket['status']}")
            
            # Test getting ticket history
            history_response = client.get(f"/api/v1/tickets/{ticket['id']}/history",
                headers=headers
            )
            print(f"✅ Get ticket history: {history_response.status_code}")
            
            if history_response.status_code == 200:
                history = history_response.json()
                print(f"   History entries: {len(history)}")
            
            # Test dashboard stats
            dashboard_response = client.get("/api/v1/reports/dashboard", headers=headers)
            print(f"✅ Dashboard stats: {dashboard_response.status_code}")
            
            if dashboard_response.status_code == 200:
                stats = dashboard_response.json()
                print(f"   Open: {stats['openTickets']}, In Progress: {stats['inProgressTickets']}")
        else:
            print(f"❌ Ticket creation failed: {ticket_response.text}")
    else:
        print(f"❌ Login failed: {response.text}")
    
    print("\\n🎉 Database integration test completed!")
    
    # Clean up test database
    if os.path.exists("./ticketing_system.db"):
        os.remove("./ticketing_system.db")
        print("🧹 Cleaned up test database")

if __name__ == "__main__":
    test_database_integration()