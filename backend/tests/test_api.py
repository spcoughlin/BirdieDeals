"""
API endpoint tests for BirdieDeals.

These tests verify the REST API endpoints work correctly.
"""

import pytest
from unittest.mock import patch, AsyncMock


class TestHealthEndpoint:
    """Test health check endpoint."""

    @pytest.mark.asyncio
    async def test_health_check(self, http_client):
        """Test /health endpoint returns ok."""
        response = await http_client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"ok": True}
        print("✓ Health check endpoint works")


class TestAuthEndpoints:
    """Test authentication endpoints."""

    @pytest.mark.asyncio
    async def test_register_success(self, http_client, sample_user_data):
        """Test successful user registration."""
        with patch("app.routers.auth_routes.on_account_created", new_callable=AsyncMock):
            response = await http_client.post(
                "/api/auth/register",
                json=sample_user_data
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "token" in data
            assert "user" in data
            assert data["user"]["email"] == sample_user_data["email"].lower()
            assert data["user"]["username"] == sample_user_data["username"]
            print(f"✓ Registration successful for {data['user']['email']}")

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, http_client, sample_user_data):
        """Test registration fails with duplicate email."""
        with patch("app.routers.auth_routes.on_account_created", new_callable=AsyncMock):
            # First registration
            await http_client.post("/api/auth/register", json=sample_user_data)
            
            # Second registration with same email
            response = await http_client.post("/api/auth/register", json=sample_user_data)
            
            assert response.status_code == 400
            print("✓ Duplicate email registration rejected")

    @pytest.mark.asyncio
    async def test_login_success(self, http_client, sample_user_data):
        """Test successful login."""
        with patch("app.routers.auth_routes.on_account_created", new_callable=AsyncMock):
            # Register first
            await http_client.post("/api/auth/register", json=sample_user_data)
            
            # Login
            response = await http_client.post(
                "/api/auth/login",
                json={
                    "email": sample_user_data["email"],
                    "password": sample_user_data["password"]
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "token" in data
            print("✓ Login successful")

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, http_client, sample_user_data):
        """Test login fails with wrong password."""
        with patch("app.routers.auth_routes.on_account_created", new_callable=AsyncMock):
            # Register first
            await http_client.post("/api/auth/register", json=sample_user_data)
            
            # Login with wrong password
            response = await http_client.post(
                "/api/auth/login",
                json={
                    "email": sample_user_data["email"],
                    "password": "wrong_password"
                }
            )
            
            assert response.status_code == 401
            print("✓ Wrong password rejected")


class TestUserEndpoints:
    """Test user endpoints."""

    @pytest.mark.asyncio
    async def test_get_me(self, http_client, sample_user_data):
        """Test /api/me returns current user."""
        with patch("app.routers.auth_routes.on_account_created", new_callable=AsyncMock):
            # Register and get token
            register_response = await http_client.post("/api/auth/register", json=sample_user_data)
            token = register_response.json()["token"]
            
            # Get current user
            response = await http_client.get(
                "/api/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["user"]["email"] == sample_user_data["email"].lower()
            print("✓ GET /api/me returns current user")

    @pytest.mark.asyncio
    async def test_get_me_unauthorized(self, http_client):
        """Test /api/me requires authentication."""
        response = await http_client.get("/api/me")
        assert response.status_code == 401
        print("✓ GET /api/me requires auth")

    @pytest.mark.asyncio
    async def test_update_profile(self, http_client, sample_user_data):
        """Test profile update."""
        with patch("app.routers.auth_routes.on_account_created", new_callable=AsyncMock):
            with patch("app.routers.user_routes.on_bag_updated", new_callable=AsyncMock):
                # Register and get token
                register_response = await http_client.post("/api/auth/register", json=sample_user_data)
                token = register_response.json()["token"]
                
                # Update profile
                new_profile = {
                    "profile": {
                        "handicap": 8,
                        "driverCarry": 260,
                        "roundsPerMonth": 10,
                    }
                }
                
                response = await http_client.post(
                    "/api/profile",
                    headers={"Authorization": f"Bearer {token}"},
                    json=new_profile
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["user"]["profile"]["handicap"] == 8
                print("✓ Profile update successful")


class TestDealsEndpoints:
    """Test deals endpoints."""

    @pytest.mark.asyncio
    async def test_featured_deals_no_auth(self, http_client):
        """Test featured deals doesn't require auth."""
        response = await http_client.get("/api/deals/featured")
        
        assert response.status_code == 200
        data = response.json()
        assert "deals" in data
        assert len(data["deals"]) > 0
        print(f"✓ Featured deals returns {len(data['deals'])} deals")

    @pytest.mark.asyncio
    async def test_suggested_deals_requires_auth(self, http_client):
        """Test suggested deals requires authentication."""
        response = await http_client.get("/api/deals/suggested")
        assert response.status_code == 401
        print("✓ Suggested deals requires auth")

    @pytest.mark.asyncio
    async def test_suggested_deals_with_auth(self, http_client, sample_user_data):
        """Test suggested deals returns personalized recommendations."""
        with patch("app.routers.auth_routes.on_account_created", new_callable=AsyncMock):
            with patch("app.routers.deals_routes.on_recommendation_generated", new_callable=AsyncMock):
                # Register and get token
                register_response = await http_client.post("/api/auth/register", json=sample_user_data)
                token = register_response.json()["token"]
                
                # Get suggested deals
                response = await http_client.get(
                    "/api/deals/suggested",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert "deals" in data
                assert "reasoning" in data
                assert "profileSummary" in data
                print(f"✓ Suggested deals returns {len(data['deals'])} personalized deals")
                print(f"  Reasoning: {data['reasoning'][:80]}...")

    @pytest.mark.asyncio
    async def test_track_deal_click(self, http_client, sample_user_data):
        """Test deal click tracking endpoint."""
        with patch("app.routers.auth_routes.on_account_created", new_callable=AsyncMock):
            with patch("app.routers.deals_routes.on_deal_clicked", new_callable=AsyncMock):
                # Register and get token
                register_response = await http_client.post("/api/auth/register", json=sample_user_data)
                token = register_response.json()["token"]
                
                # Track click
                response = await http_client.post(
                    "/api/deals/click",
                    headers={"Authorization": f"Bearer {token}"},
                    json={"dealId": "d1"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["ok"] is True
                print("✓ Deal click tracking works")
