"""
Pytest configuration and fixtures for FinTrack Backend tests.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)

@pytest.fixture
def sample_bank_data():
    """Sample bank data for testing."""
    return {
        "name": "Test Bank",
        "balance": 1000.00
    }

@pytest.fixture
def sample_category_data():
    """Sample category data for testing."""
    return {
        "name": "Test Category",
        "color": "#FF5733",
        "icon": "test-icon",
        "monthly_limit": 5000.00
    }

@pytest.fixture
def sample_transaction_data():
    """Sample transaction data for testing."""
    return {
        "description": "Test Transaction",
        "amount": 100.00,
        "type": "expense",
        "date": "2024-01-15",
        "bank_id": "test-bank-id",
        "category_id": "test-category-id"
    }