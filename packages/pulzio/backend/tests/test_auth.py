import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_signup_endpoint_exists():
    """Test that signup endpoint exists"""
    # This will fail until we implement signup
    # For now, just check endpoint exists
    response = client.post("/auth/signup", json={})
    # Should return 422 (validation error) not 404
    assert response.status_code != 404


def test_health_endpoint():
    """Test health endpoint"""
    response = client.get("/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

