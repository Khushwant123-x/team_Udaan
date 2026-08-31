import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["standard"] == "OIML Recommendation R 76-1:2006"
    assert "Legal Metrology" in data["lab"]


def test_login_invalid_credentials():
    response = client.post("/api/v1/auth/login", json={"username": "invalid", "password": "wrongpassword"})
    assert response.status_code == 401
