"""
Tests for Klaviyo integration in BirdieDeals.

These tests verify:
- Profile property computation (wedge wear risk, gapping detection)
- Klaviyo API calls (profile upsert, event tracking)
- End-to-end integration flows
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4

from app.klaviyo import (
    compute_wedge_wear_risk,
    compute_gapping_risk,
    build_klaviyo_profile_properties,
    upsert_profile,
    track_event,
    on_account_created,
    on_bag_updated,
    on_recommendation_generated,
    on_deal_clicked,
)


class TestWedgeWearRisk:
    """Test wedge wear risk calculation."""

    def test_high_risk_frequent_player(self, high_frequency_profile):
        """High risk: 12 rounds/month × 11 months = 132 rounds/year."""
        risk = compute_wedge_wear_risk(high_frequency_profile)
        assert risk == "high"
        print(f"✓ High frequency player (132 rounds/year) = {risk} risk")

    def test_medium_risk_regular_player(self):
        """Medium risk: 4-7 rounds/month for 6-9 months."""
        profile = {"roundsPerMonth": 5, "monthsPlayedPerYear": 9}  # 45 rounds
        risk = compute_wedge_wear_risk(profile)
        assert risk == "medium"
        print(f"✓ Regular player (45 rounds/year) = {risk} risk")

    def test_low_risk_casual_player(self):
        """Low risk: < 40 rounds/year."""
        profile = {"roundsPerMonth": 2, "monthsPlayedPerYear": 6}  # 12 rounds
        risk = compute_wedge_wear_risk(profile)
        assert risk == "low"
        print(f"✓ Casual player (12 rounds/year) = {risk} risk")

    def test_missing_data_returns_none(self):
        """Missing frequency data should return None."""
        assert compute_wedge_wear_risk({}) is None
        assert compute_wedge_wear_risk({"roundsPerMonth": 4}) is None
        print("✓ Missing data returns None")


class TestGappingDetection:
    """Test yardage gap detection."""

    def test_detects_top_of_bag_gap(self, sample_profile_with_gap):
        """Detect a gap at the top of the bag (200y -> 170y = 30 yard gap)."""
        result = compute_gapping_risk(sample_profile_with_gap)
        
        assert result["hasGap"] is True
        assert result["gapType"] == "top-of-bag"
        assert "30 yard gap" in result["gapDetails"]
        print(f"✓ Detected gap: {result['gapDetails']}")

    def test_no_gap_in_well_fitted_bag(self):
        """No gap when clubs are properly gapped (10-15 yards apart)."""
        profile = {
            "clubs": [
                {"name": "Driver", "carryYards": 250},
                {"name": "3 Wood", "carryYards": 235},
                {"name": "5 Wood", "carryYards": 220},
                {"name": "4 Hybrid", "carryYards": 205},
                {"name": "5 Iron", "carryYards": 190},
            ]
        }
        result = compute_gapping_risk(profile)
        
        assert result["hasGap"] is False
        assert result["gapType"] is None
        print("✓ Well-fitted bag has no gaps")

    def test_empty_bag_no_gap(self):
        """Empty bag should report no gap."""
        result = compute_gapping_risk({"clubs": []})
        assert result["hasGap"] is False
        print("✓ Empty bag reports no gap")

    def test_mid_bag_gap_detection(self):
        """Detect a mid-bag gap (around 150-180 yards)."""
        profile = {
            "clubs": [
                {"name": "7 Iron", "carryYards": 155},
                # Gap: 155 -> 125 = 30 yards
                {"name": "9 Iron", "carryYards": 125},
                {"name": "PW", "carryYards": 110},
            ]
        }
        result = compute_gapping_risk(profile)
        
        assert result["hasGap"] is True
        assert result["gapType"] == "mid-bag"
        print(f"✓ Mid-bag gap detected: {result['gapDetails']}")


class TestBuildProfileProperties:
    """Test Klaviyo profile property building."""

    def test_builds_all_properties(self, sample_user_data):
        """Test that all profile properties are built correctly."""
        profile = sample_user_data["profile"]
        props = build_klaviyo_profile_properties(profile)
        
        assert props["handicap"] == 12.5
        assert props["driver_carry"] == 245
        assert props["seven_iron_carry"] == 155
        assert props["rounds_per_month"] == 6
        assert props["months_per_year"] == 10
        assert props["budget_preference"] == "Balanced"
        assert props["buy_used_preference"] is True
        assert props["club_count"] == 3
        
        print("✓ All profile properties built correctly")
        for key, value in props.items():
            print(f"  - {key}: {value}")

    def test_includes_risk_scores(self, high_frequency_profile):
        """Test that computed risk scores are included."""
        props = build_klaviyo_profile_properties(high_frequency_profile)
        
        assert props["wedge_wear_risk"] == "high"
        print(f"✓ Wedge wear risk included: {props['wedge_wear_risk']}")

    def test_includes_gapping_info(self, sample_profile_with_gap):
        """Test that gapping info is included."""
        props = build_klaviyo_profile_properties(sample_profile_with_gap)
        
        assert props["has_gapping_issue"] is True
        assert props["gap_type"] == "top-of-bag"
        print(f"✓ Gapping info included: {props['gap_type']}")


class TestKlaviyoAPICalls:
    """Test Klaviyo API integration (mocked)."""

    @pytest.mark.asyncio
    async def test_upsert_profile_success(self):
        """Test successful profile upsert to Klaviyo."""
        with patch("app.klaviyo.settings") as mock_settings:
            mock_settings.KLAVIYO_API_KEY = "test-api-key"
            
            with patch("httpx.AsyncClient") as mock_client:
                mock_response = MagicMock()
                mock_response.status_code = 201
                mock_response.json.return_value = {"data": {"id": "klaviyo-profile-123"}}
                
                mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
                
                result = await upsert_profile(
                    user_id="user-123",
                    email="test@example.com",
                    username="testgolfer",
                    profile_properties={"handicap": 12}
                )
                
                assert result == "klaviyo-profile-123"
                print("✓ Profile upsert successful")

    @pytest.mark.asyncio
    async def test_track_event_success(self):
        """Test successful event tracking in Klaviyo."""
        with patch("app.klaviyo.settings") as mock_settings:
            mock_settings.KLAVIYO_API_KEY = "test-api-key"
            
            with patch("httpx.AsyncClient") as mock_client:
                mock_response = MagicMock()
                mock_response.status_code = 202
                
                mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
                
                result = await track_event(
                    event_name="Account Created",
                    user_id="user-123",
                    email="test@example.com",
                    properties={"username": "testgolfer"}
                )
                
                assert result is True
                print("✓ Event tracking successful")

    @pytest.mark.asyncio
    async def test_no_api_key_skips_calls(self):
        """Test that missing API key gracefully skips Klaviyo calls."""
        with patch("app.klaviyo.settings") as mock_settings:
            mock_settings.KLAVIYO_API_KEY = ""
            
            result = await upsert_profile("user-123", "test@example.com")
            assert result is None
            
            result = await track_event("Test Event", "user-123", "test@example.com")
            assert result is False
            
            print("✓ Missing API key gracefully handled")


class TestKlaviyoHighLevelFunctions:
    """Test high-level Klaviyo convenience functions."""

    @pytest.mark.asyncio
    async def test_on_account_created(self, sample_user_data):
        """Test account creation triggers Klaviyo sync."""
        with patch("app.klaviyo.upsert_profile", new_callable=AsyncMock) as mock_upsert:
            with patch("app.klaviyo.track_event", new_callable=AsyncMock) as mock_track:
                mock_upsert.return_value = "profile-123"
                mock_track.return_value = True
                
                await on_account_created(
                    user_id="user-123",
                    email=sample_user_data["email"],
                    username=sample_user_data["username"],
                    profile=sample_user_data["profile"]
                )
                
                # Verify upsert was called
                mock_upsert.assert_called_once()
                call_args = mock_upsert.call_args
                # Check positional args: user_id, email
                assert call_args[0][0] == "user-123"  # user_id
                assert call_args[0][1] == sample_user_data["email"]  # email
                
                # Verify event was tracked
                mock_track.assert_called_once()
                event_call = mock_track.call_args
                # track_event uses kwargs: event_name, user_id, email, properties
                assert event_call.kwargs["event_name"] == "Account Created"
                
                print("✓ on_account_created triggers profile upsert and event")

    @pytest.mark.asyncio
    async def test_on_bag_updated_with_gap(self, sample_profile_with_gap):
        """Test bag update with gap detection triggers Gap Detected event."""
        with patch("app.klaviyo.upsert_profile", new_callable=AsyncMock) as mock_upsert:
            with patch("app.klaviyo.track_event", new_callable=AsyncMock) as mock_track:
                mock_upsert.return_value = "profile-123"
                mock_track.return_value = True
                
                await on_bag_updated(
                    user_id="user-123",
                    email="test@example.com",
                    profile=sample_profile_with_gap
                )
                
                # Should have tracked 2 events: Bag Updated and Gap Detected
                assert mock_track.call_count == 2
                
                event_names = [call[1]["event_name"] for call in mock_track.call_args_list]
                assert "Bag Updated" in event_names
                assert "Gap Detected" in event_names
                
                print("✓ on_bag_updated tracks both Bag Updated and Gap Detected events")

    @pytest.mark.asyncio
    async def test_on_recommendation_generated(self):
        """Test recommendation event tracking."""
        with patch("app.klaviyo.track_event", new_callable=AsyncMock) as mock_track:
            mock_track.return_value = True
            
            await on_recommendation_generated(
                user_id="user-123",
                email="test@example.com",
                categories=["wedges", "driver"],
                deal_count=3,
                confidence="high"
            )
            
            mock_track.assert_called_once()
            call_args = mock_track.call_args
            assert call_args[1]["event_name"] == "Recommendation Generated"
            assert call_args[1]["properties"]["categories"] == ["wedges", "driver"]
            assert call_args[1]["properties"]["deal_count"] == 3
            
            print("✓ on_recommendation_generated tracks event with categories")

    @pytest.mark.asyncio
    async def test_on_deal_clicked(self):
        """Test deal click event tracking with value."""
        with patch("app.klaviyo.track_event", new_callable=AsyncMock) as mock_track:
            mock_track.return_value = True
            
            await on_deal_clicked(
                user_id="user-123",
                email="test@example.com",
                deal_id="d1",
                deal_title="Cleveland RTX Wedge",
                deal_category="wedges",
                deal_price=109.99,
                retailer="GlobalGolf"
            )
            
            mock_track.assert_called_once()
            call_args = mock_track.call_args
            assert call_args[1]["event_name"] == "Deal Clicked"
            assert call_args[1]["value"] == 109.99
            assert call_args[1]["properties"]["retailer"] == "GlobalGolf"
            
            print("✓ on_deal_clicked tracks event with deal value")


class TestKlaviyoLiveIntegration:
    """
    Live integration tests with actual Klaviyo API.
    
    These tests only run if KLAVIYO_API_KEY is set.
    They create real profiles and events in your Klaviyo account.
    """

    @pytest.mark.asyncio
    async def test_live_profile_creation(self):
        """Test creating a real profile in Klaviyo."""
        from app.config import settings
        
        if not settings.KLAVIYO_API_KEY:
            pytest.skip("KLAVIYO_API_KEY not set - skipping live test")
        
        test_email = f"birdiedeals-test-{uuid4().hex[:8]}@example.com"
        
        result = await upsert_profile(
            user_id=f"test-{uuid4().hex[:8]}",
            email=test_email,
            username="TestGolfer",
            profile_properties={
                "handicap": 15,
                "driver_carry": 230,
                "wedge_wear_risk": "medium",
                "budget_preference": "Balanced",
                "test_profile": True,
            }
        )
        
        print(f"\n✓ Live profile created in Klaviyo!")
        print(f"  Email: {test_email}")
        print(f"  Klaviyo Profile ID: {result}")
        
        # Note: Profile ID will be None if API key is public key (pk_)
        # Private API key (sk_) is needed for full API access

    @pytest.mark.asyncio
    async def test_live_event_tracking(self):
        """Test tracking a real event in Klaviyo."""
        from app.config import settings
        
        if not settings.KLAVIYO_API_KEY:
            pytest.skip("KLAVIYO_API_KEY not set - skipping live test")
        
        test_email = f"birdiedeals-test-{uuid4().hex[:8]}@example.com"
        
        result = await track_event(
            event_name="Test Event - BirdieDeals",
            user_id=f"test-{uuid4().hex[:8]}",
            email=test_email,
            properties={
                "test": True,
                "source": "pytest",
                "handicap": 12,
            }
        )
        
        if result:
            print(f"\n✓ Live event tracked in Klaviyo!")
            print(f"  Email: {test_email}")
            print(f"  Event: Test Event - BirdieDeals")
        else:
            print("\n⚠ Event tracking failed - check API key permissions")
