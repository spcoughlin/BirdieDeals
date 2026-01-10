"""
Tests for MongoDB operations in BirdieDeals.

These tests verify:
- User creation and retrieval
- Profile updates
- Data persistence
"""

import pytest
from uuid import uuid4
from datetime import datetime, timezone

from app.auth import hash_password, verify_password


class TestUserCreation:
    """Test user creation in MongoDB."""

    @pytest.mark.asyncio
    async def test_create_user(self, test_db, sample_user_data):
        """Test creating a new user document."""
        user_id = str(uuid4())
        now = datetime.now(timezone.utc)
        
        doc = {
            "_id": user_id,
            "username": sample_user_data["username"],
            "email": sample_user_data["email"].lower(),
            "password_hash": hash_password(sample_user_data["password"]),
            "profile": sample_user_data["profile"],
            "created_at": now,
            "updated_at": now,
        }
        
        result = await test_db.users.insert_one(doc)
        assert result.inserted_id == user_id
        
        # Verify user was created
        user = await test_db.users.find_one({"_id": user_id})
        assert user is not None
        assert user["username"] == sample_user_data["username"]
        assert user["email"] == sample_user_data["email"].lower()
        print(f"✓ Created user: {user['username']} ({user['email']})")

    @pytest.mark.asyncio
    async def test_password_hashing(self):
        """Test password hashing and verification."""
        password = "TestPassword123!"  # Use a simple, shorter password
        hashed = hash_password(password)
        
        # Hash should not equal plain password
        assert hashed != password
        
        # Verification should work
        assert verify_password(password, hashed) is True
        assert verify_password("wrong_password", hashed) is False
        print("✓ Password hashing works correctly")

    @pytest.mark.asyncio
    async def test_duplicate_email_prevention(self, test_db, sample_user_data):
        """Test that duplicate emails are handled."""
        email = sample_user_data["email"].lower()
        
        # Create first user
        await test_db.users.insert_one({
            "_id": str(uuid4()),
            "email": email,
            "username": "first_user",
            "password_hash": hash_password("password123"),
            "profile": {},
        })
        
        # Check for existing email
        existing = await test_db.users.find_one({"email": email})
        assert existing is not None
        print(f"✓ Duplicate email check works for: {email}")


class TestProfileOperations:
    """Test profile CRUD operations."""

    @pytest.mark.asyncio
    async def test_update_profile(self, test_db, sample_user_data):
        """Test updating a user's golf profile."""
        user_id = str(uuid4())
        
        # Create user with initial profile
        await test_db.users.insert_one({
            "_id": user_id,
            "username": sample_user_data["username"],
            "email": sample_user_data["email"],
            "password_hash": hash_password(sample_user_data["password"]),
            "profile": {"handicap": 20},
        })
        
        # Update profile
        new_profile = sample_user_data["profile"]
        result = await test_db.users.update_one(
            {"_id": user_id},
            {"$set": {"profile": new_profile, "updated_at": datetime.now(timezone.utc)}}
        )
        
        assert result.modified_count == 1
        
        # Verify update
        user = await test_db.users.find_one({"_id": user_id})
        assert user["profile"]["handicap"] == new_profile["handicap"]
        assert user["profile"]["driverCarry"] == new_profile["driverCarry"]
        assert len(user["profile"]["clubs"]) == len(new_profile["clubs"])
        print(f"✓ Profile updated: handicap {new_profile['handicap']}, {len(new_profile['clubs'])} clubs")

    @pytest.mark.asyncio
    async def test_add_club_to_bag(self, test_db, sample_user_data):
        """Test adding a new club to user's bag."""
        user_id = str(uuid4())
        initial_clubs = sample_user_data["profile"]["clubs"][:2]
        
        # Create user with partial bag
        await test_db.users.insert_one({
            "_id": user_id,
            "username": sample_user_data["username"],
            "email": sample_user_data["email"],
            "password_hash": hash_password(sample_user_data["password"]),
            "profile": {"clubs": initial_clubs},
        })
        
        # Add a new club
        new_club = {
            "name": "Putter",
            "brand": "Scotty Cameron",
            "model": "Newport 2",
            "carryYards": None,
            "usage": "primary"
        }
        
        result = await test_db.users.update_one(
            {"_id": user_id},
            {"$push": {"profile.clubs": new_club}}
        )
        
        assert result.modified_count == 1
        
        # Verify
        user = await test_db.users.find_one({"_id": user_id})
        assert len(user["profile"]["clubs"]) == 3
        assert user["profile"]["clubs"][-1]["name"] == "Putter"
        print(f"✓ Added club: {new_club['brand']} {new_club['model']}")

    @pytest.mark.asyncio
    async def test_query_users_by_handicap(self, test_db):
        """Test querying users by handicap range."""
        # Create multiple users with different handicaps
        users_data = [
            {"_id": str(uuid4()), "email": f"low_{uuid4().hex[:4]}@test.com", "profile": {"handicap": 5}},
            {"_id": str(uuid4()), "email": f"mid_{uuid4().hex[:4]}@test.com", "profile": {"handicap": 15}},
            {"_id": str(uuid4()), "email": f"high_{uuid4().hex[:4]}@test.com", "profile": {"handicap": 25}},
        ]
        
        await test_db.users.insert_many(users_data)
        
        # Query mid-handicappers (10-20)
        cursor = test_db.users.find({
            "profile.handicap": {"$gte": 10, "$lte": 20}
        })
        mid_handicappers = await cursor.to_list(length=100)
        
        assert len(mid_handicappers) == 1
        assert mid_handicappers[0]["profile"]["handicap"] == 15
        print(f"✓ Found {len(mid_handicappers)} mid-handicapper(s)")


class TestClubDataStructure:
    """Test club data structure and queries."""

    @pytest.mark.asyncio
    async def test_club_structure(self, test_db, sample_user_data):
        """Test that club data is stored correctly."""
        user_id = str(uuid4())
        
        await test_db.users.insert_one({
            "_id": user_id,
            "email": sample_user_data["email"],
            "username": sample_user_data["username"],
            "password_hash": hash_password(sample_user_data["password"]),
            "profile": sample_user_data["profile"],
        })
        
        user = await test_db.users.find_one({"_id": user_id})
        clubs = user["profile"]["clubs"]
        
        # Verify club structure
        driver = next((c for c in clubs if c["name"] == "Driver"), None)
        assert driver is not None
        assert driver["brand"] == "TaylorMade"
        assert driver["model"] == "Stealth 2"
        assert driver["carryYards"] == 245
        assert driver["loft"] == 10.5
        print(f"✓ Club data structure verified: {driver['brand']} {driver['model']}")

    @pytest.mark.asyncio
    async def test_query_users_with_specific_brand(self, test_db, sample_user_data):
        """Test querying users who have clubs of a specific brand."""
        user_id = str(uuid4())
        
        await test_db.users.insert_one({
            "_id": user_id,
            "email": sample_user_data["email"],
            "username": sample_user_data["username"],
            "password_hash": "hash",
            "profile": sample_user_data["profile"],
        })
        
        # Find users with TaylorMade clubs
        cursor = test_db.users.find({
            "profile.clubs.brand": "TaylorMade"
        })
        users = await cursor.to_list(length=100)
        
        assert len(users) >= 1
        print(f"✓ Found {len(users)} user(s) with TaylorMade clubs")
