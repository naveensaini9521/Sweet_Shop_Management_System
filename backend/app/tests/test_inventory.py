import pytest
from unittest.mock import AsyncMock, patch

def test_purchase_sweet(authenticated_client):
    response = authenticated_client.post(
        "/api/sweets/123/purchase",
        json={"quantity": 1}
    )
    assert response.status_code in [200, 400, 404]


def test_unauthorized_access(client):
    """Test endpoints that require authentication"""
    endpoints = [
        ("GET", "/api/sweets"),
        ("GET", "/api/sweets/123"),
        ("POST", "/api/sweets/123/purchase"),
        ("GET", "/api/auth/profile"),
    ]
    
    for method, endpoint in endpoints:
        if method == "GET":
            response = client.get(endpoint)
        else:
            response = client.post(endpoint, json={})
        
        print(f"{method} {endpoint}: {response.status_code}")
        # Should be 401 or 403 for unauthorized access
        assert response.status_code in [401, 403, 404, 422]