"""
Pytest configuration and fixtures for BirdieDeals backend tests.
"""

import pytest
from typing import AsyncGenerator, Dict, Any
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.config import settings
from app.auth import create_access_token, hash_password


# Use a separate test database
TEST_DB_NAME = "birdiedeals_test"


@pytest.fixture
async def mongo_client() -> AsyncGenerator[AsyncIOMotorClient, None]:
    """Create MongoDB client for tests."""
    client = AsyncIOMotorClient(settings.MONGO_URI)
    yield client
    client.close()


@pytest.fixture
async def test_db(mongo_client: AsyncIOMotorClient):
    """Get test database and clean up after each test."""
    db = mongo_client[TEST_DB_NAME]
    yield db
    # Clean up after each test
    await db.users.delete_many({})


@pytest.fixture
async def http_client() -> AsyncGenerator[AsyncClient, None]:
    """Create async HTTP client for API tests."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def sample_user_data() -> Dict[str, Any]:
    """Sample user registration data."""
    return {
        "username": f"testgolfer_{uuid4().hex[:8]}",
        "email": f"test_{uuid4().hex[:8]}@example.com",
        "password": "TestPassword123!",
        "profile": {
            "handicap": 12.5,
            "driverCarry": 245,
            "sevenIronCarry": 155,
            "roundsPerMonth": 6,
            "monthsPlayedPerYear": 10,
            "region": "Northeast",
            "budgetSensitivity": "Balanced",
            "willingToBuyUsed": True,
            "preferredBrands": ["TaylorMade", "Callaway"],
            "clubs": [
                {
                    "name": "Driver",
                    "brand": "TaylorMade",
                    "model": "Stealth 2",
                    "loft": 10.5,
                    "carryYards": 245,
                    "usage": "primary"
                },
                {
                    "name": "7 Iron",
                    "brand": "Callaway",
                    "model": "Apex",
                    "loft": 30,
                    "carryYards": 155,
                    "usage": "primary"
                },
                {
                    "name": "56° Wedge",
                    "brand": "Titleist",
                    "model": "Vokey SM9",
                    "loft": 56,
                    "carryYards": 85,
                    "usage": "primary"
                }
            ]
        }
    }


@pytest.fixture
def sample_profile_with_gap() -> Dict[str, Any]:
    """Sample profile with a yardage gap for testing gap detection."""
    return {
        "handicap": 15,
        "driverCarry": 230,
        "sevenIronCarry": 150,
        "roundsPerMonth": 8,
        "monthsPlayedPerYear": 10,
        "budgetSensitivity": "Value-First",
        "willingToBuyUsed": True,
        "clubs": [
            {"name": "Driver", "brand": "Callaway", "model": "Mavrik", "carryYards": 230},
            {"name": "5 Wood", "brand": "Callaway", "model": "Mavrik", "carryYards": 200},
            # Gap here: 200 -> 170 = 30 yard gap
            {"name": "5 Iron", "brand": "Callaway", "model": "Apex", "carryYards": 170},
            {"name": "6 Iron", "brand": "Callaway", "model": "Apex", "carryYards": 160},
            {"name": "7 Iron", "brand": "Callaway", "model": "Apex", "carryYards": 150},
        ]
    }


@pytest.fixture
def high_frequency_profile() -> Dict[str, Any]:
    """Profile for a frequent player (high wedge wear risk)."""
    return {
        "handicap": 8,
        "roundsPerMonth": 12,
        "monthsPlayedPerYear": 11,
        "budgetSensitivity": "Performance-First",
        "willingToBuyUsed": False,
    }


@pytest.fixture
async def authenticated_user(test_db, sample_user_data) -> Dict[str, Any]:
    """Create a user in the test DB and return user data with token."""
    user_id = str(uuid4())
    doc = {
        "_id": user_id,
        "username": sample_user_data["username"],
        "email": sample_user_data["email"].lower(),
        "password_hash": hash_password(sample_user_data["password"]),
        "profile": sample_user_data["profile"],
    }
    await test_db.users.insert_one(doc)
    
    token = create_access_token(subject=user_id)
    
    return {
        "user_id": user_id,
        "token": token,
        "email": doc["email"],
        "username": doc["username"],
        "profile": doc["profile"],
    }
