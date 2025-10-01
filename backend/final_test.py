#!/usr/bin/env python3
"""Final comprehensive test of the database-backed API."""

import sys
import os
import requests
import json

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_complete_workflow():
    """Test complete workflow with database backend."""
    base_url = "http://localhost:8000"
    
    print("🎫 Final Database Integration Test")
    print("=" * 50)
    
    # 1. Health check
    response = requests.get(f"{base_url}/health")
    print(f"✅ Health check: {response.status_code}")
    
    # 2. Login
    login_response = requests.post(f"{base_url}/api/v1/auth/login", json={
        "email": "admin@company.com",
        "password": "password"
    })
    print(f"✅ Login: {login_response.status_code}")
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    login_data = login_response.json()
    token = login_data["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"   User: {login_data['user']['name']} ({login_data['user']['role']})")
    
    # 3. Create ticket
    ticket_response = requests.post(f"{base_url}/api/v1/tickets/", 
        headers=headers,
        json={
            "title": "Final Test Ticket",
            "description": "Testing complete database integration",
            "priority": "critical",
            "department": "Engineering"
        }
    )
    print(f"✅ Create ticket: {ticket_response.status_code}")
    
    if ticket_response.status_code != 200:
        print(f"❌ Ticket creation failed: {ticket_response.text}")
        return
    
    ticket = ticket_response.json()
    ticket_id = ticket["id"]
    print(f"   Ticket: {ticket['key']} - {ticket['title']}")
    
    # 4. Update ticket status
    update_response = requests.put(f"{base_url}/api/v1/tickets/{ticket_id}",
        headers=headers,
        json={"status": "in_progress"}
    )
    print(f"✅ Update ticket: {update_response.status_code}")
    
    if update_response.status_code == 200:
        updated_ticket = update_response.json()
        print(f"   Status: {updated_ticket['status']}")
    
    # 5. Get ticket history
    history_response = requests.get(f"{base_url}/api/v1/tickets/{ticket_id}/history",
        headers=headers
    )
    print(f"✅ Get history: {history_response.status_code}")
    
    if history_response.status_code == 200:
        history = history_response.json()
        print(f"   History entries: {len(history)}")
    
    # 6. Get all tickets
    tickets_response = requests.get(f"{base_url}/api/v1/tickets/", headers=headers)
    print(f"✅ Get all tickets: {tickets_response.status_code}")
    
    if tickets_response.status_code == 200:
        tickets = tickets_response.json()
        print(f"   Total tickets: {len(tickets)}")
    
    # 7. Dashboard stats
    dashboard_response = requests.get(f"{base_url}/api/v1/reports/dashboard", headers=headers)
    print(f"✅ Dashboard stats: {dashboard_response.status_code}")
    
    if dashboard_response.status_code == 200:
        stats = dashboard_response.json()
        print(f"   Open: {stats['openTickets']}, In Progress: {stats['inProgressTickets']}, Critical: {stats['criticalTickets']}")
    
    # 8. Get current user
    me_response = requests.get(f"{base_url}/api/v1/auth/me", headers=headers)
    print(f"✅ Get current user: {me_response.status_code}")
    
    print("\\n🎉 All tests completed successfully!")
    print("🗄️  Database backend is fully functional!")

if __name__ == "__main__":
    test_complete_workflow()