"""
Klaviyo integration service for BirdieDeals.

This module handles:
- Creating/updating customer profiles with golf-specific properties
- Tracking events (Account Created, Bag Updated, Gap Detected, etc.)

Klaviyo API docs: https://developers.klaviyo.com/en/reference/api-overview
"""

import httpx
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import logging

from .config import settings

logger = logging.getLogger(__name__)

KLAVIYO_BASE_URL = "https://a.klaviyo.com"
KLAVIYO_REVISION = "2025-01-15"  # API revision header


def _headers() -> Dict[str, str]:
    """Common headers for Klaviyo API requests."""
    return {
        "Authorization": f"Klaviyo-API-Key {settings.KLAVIYO_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "revision": KLAVIYO_REVISION,
    }


# -----------------------------------------------------------------------------
# Profile property computation (golf-specific derived scores)
# -----------------------------------------------------------------------------


def compute_wedge_wear_risk(profile: Dict[str, Any]) -> Optional[str]:
    """
    Estimate wedge wear risk based on rounds per month.
    
    - High: 8+ rounds/month
    - Medium: 4-7 rounds/month
    - Low: <4 rounds/month
    
    Returns None if roundsPerMonth is not provided.
    """
    rounds_per_month = profile.get("roundsPerMonth")
    
    if rounds_per_month is None:
        return None
    
    if rounds_per_month >= 8:
        return "high"
    elif rounds_per_month >= 4:
        return "medium"
    else:
        return "low"


def compute_gapping_risk(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Detect gaps in the bag based on club yardages.
    
    Only analyzes clubs that have carryYards data (e.g., drivers, woods).
    Clubs without carry distance (irons, putters) are skipped.
    
    Returns:
        {
            "hasGap": bool,
            "gapType": "top-of-bag" | "mid-bag" | "wedge-gap" | None,
            "gapDetails": str or None
        }
    """
    clubs = profile.get("clubs", [])
    if not clubs:
        return {"hasGap": False, "gapType": None, "gapDetails": None}
    
    # Only analyze clubs with carryYards data
    clubs_with_carry = [c for c in clubs if c.get("carryYards") is not None]
    if len(clubs_with_carry) < 2:
        # Not enough data to detect gaps
        return {"hasGap": False, "gapType": None, "gapDetails": None}
    
    sorted_clubs = sorted(clubs_with_carry, key=lambda c: c["carryYards"], reverse=True)
    
    # Check for gaps > 20 yards between consecutive clubs
    for i in range(len(sorted_clubs) - 1):
        upper = sorted_clubs[i]
        lower = sorted_clubs[i + 1]
        gap = upper["carryYards"] - lower["carryYards"]
        
        if gap > 20:
            upper_carry = upper["carryYards"]
            # Determine gap type based on yardage
            if upper_carry >= 200:
                gap_type = "top-of-bag"
            elif upper_carry >= 150:
                gap_type = "mid-bag"
            else:
                gap_type = "wedge-gap"
            
            return {
                "hasGap": True,
                "gapType": gap_type,
                "gapDetails": f"{gap} yard gap between {upper.get('name', 'club')} ({upper_carry}y) and {lower.get('name', 'club')} ({lower['carryYards']}y)"
            }
    
    return {"hasGap": False, "gapType": None, "gapDetails": None}


def build_klaviyo_profile_properties(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract and compute Klaviyo profile properties from the golfer profile.
    
    Only includes fields that are actually present in the profile (not None).
    """
    props = {}
    
    # Core golf profile fields - only if present and not None
    if profile.get("handicap") is not None:
        props["handicap"] = profile["handicap"]
    if profile.get("driverCarry"):
        props["driver_carry"] = profile["driverCarry"]
    if profile.get("sevenIronCarry"):
        props["seven_iron_carry"] = profile["sevenIronCarry"]
    if profile.get("roundsPerMonth"):
        props["rounds_per_month"] = profile["roundsPerMonth"]
    if profile.get("monthsPlayedPerYear"):  # Only include if not None
        props["months_per_year"] = profile["monthsPlayedPerYear"]
    if profile.get("region"):
        props["region"] = profile["region"]
    
    # Demographics
    if profile.get("ageRange"):
        props["age_range"] = profile["ageRange"]
    if profile.get("dominantHand"):
        props["dominant_hand"] = profile["dominantHand"]
    if profile.get("yearsPlaying"):
        props["years_playing"] = profile["yearsPlaying"]
    
    # Preferences
    if profile.get("budgetSensitivity"):
        props["budget_preference"] = profile["budgetSensitivity"]
    if profile.get("willingToBuyUsed") is not None:
        props["buy_used_preference"] = profile["willingToBuyUsed"]
    if profile.get("preferredBrands"):
        props["preferred_brands"] = profile["preferredBrands"]
    
    # Computed risk scores (only if we have data)
    wedge_risk = compute_wedge_wear_risk(profile)
    if wedge_risk:
        props["wedge_wear_risk"] = wedge_risk
    
    gapping = compute_gapping_risk(profile)
    if gapping["hasGap"]:
        props["has_gapping_issue"] = True
        props["gap_type"] = gapping["gapType"]
    else:
        props["has_gapping_issue"] = False
    
    # Club count
    clubs = profile.get("clubs", [])
    if clubs:
        props["club_count"] = len(clubs)
        # List club types
        club_names = [c.get("name") for c in clubs if c.get("name")]
        if club_names:
            props["club_types"] = club_names
    
    return props


# -----------------------------------------------------------------------------
# Klaviyo API calls
# -----------------------------------------------------------------------------


async def upsert_profile(
    user_id: str,
    email: str,
    username: Optional[str] = None,
    profile_properties: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """
    Create or update a Klaviyo profile.
    
    Uses the Profiles API to upsert by email (external_id can also be set).
    Returns the Klaviyo profile ID on success, None on failure.
    """
    if not settings.KLAVIYO_API_KEY:
        logger.warning("KLAVIYO_API_KEY not set, skipping profile upsert")
        return None
    
    properties = profile_properties or {}
    properties["birdiedeals_user_id"] = user_id
    
    payload = {
        "data": {
            "type": "profile",
            "attributes": {
                "email": email,
                "external_id": user_id,
                "properties": properties,
            }
        }
    }
    
    if username:
        # Split username as first name for personalization
        payload["data"]["attributes"]["first_name"] = username
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{KLAVIYO_BASE_URL}/api/profile-import",
                headers=_headers(),
                json=payload,
            )
            
            if resp.status_code in (200, 201, 202):
                data = resp.json()
                profile_id = data.get("data", {}).get("id")
                logger.info(f"Klaviyo profile upserted: {profile_id}")
                return profile_id
            else:
                logger.error(f"Klaviyo profile upsert failed: {resp.status_code} {resp.text}")
                return None
    except Exception as e:
        logger.error(f"Klaviyo profile upsert error: {e}")
        return None


async def track_event(
    event_name: str,
    user_id: str,
    email: str,
    properties: Optional[Dict[str, Any]] = None,
    value: Optional[float] = None,
) -> bool:
    """
    Track a custom event in Klaviyo.
    
    Events:
    - Account Created
    - Bag Updated
    - Gap Detected
    - Recommendation Generated
    - Deal Viewed
    - Deal Clicked
    
    Returns True on success, False on failure.
    """
    if not settings.KLAVIYO_API_KEY:
        logger.warning("KLAVIYO_API_KEY not set, skipping event tracking")
        return False
    
    event_props = properties or {}
    
    payload = {
        "data": {
            "type": "event",
            "attributes": {
                "metric": {
                    "data": {
                        "type": "metric",
                        "attributes": {
                            "name": event_name,
                        }
                    }
                },
                "profile": {
                    "data": {
                        "type": "profile",
                        "attributes": {
                            "email": email,
                            "external_id": user_id,
                        }
                    }
                },
                "properties": event_props,
                "time": datetime.now(timezone.utc).isoformat(),
            }
        }
    }
    
    if value is not None:
        payload["data"]["attributes"]["value"] = value
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{KLAVIYO_BASE_URL}/api/events",
                headers=_headers(),
                json=payload,
            )
            
            if resp.status_code in (200, 201, 202):
                logger.info(f"Klaviyo event tracked: {event_name} for {email}")
                return True
            else:
                logger.error(f"Klaviyo event tracking failed: {resp.status_code} {resp.text}")
                return False
    except Exception as e:
        logger.error(f"Klaviyo event tracking error: {e}")
        return False


# -----------------------------------------------------------------------------
# High-level convenience functions
# -----------------------------------------------------------------------------


async def on_account_created(
    user_id: str,
    email: str,
    username: str,
    profile: Dict[str, Any],
) -> None:
    """
    Called after a new user registers.
    
    1. Upserts Klaviyo profile with golf properties
    2. Tracks 'Account Created' event
    """
    logger.info(f"[KLAVIYO] on_account_created called for: {email} (user_id={user_id})")
    props = build_klaviyo_profile_properties(profile)
    logger.info(f"[KLAVIYO] Built profile properties: {props}")
    
    profile_id = await upsert_profile(user_id, email, username, props)
    logger.info(f"[KLAVIYO] Profile upserted: {profile_id}")
    
    event_result = await track_event(
        event_name="Account Created",
        user_id=user_id,
        email=email,
        properties={
            "username": username,
            "has_profile": bool(profile),
        },
    )
    logger.info(f"[KLAVIYO] Account Created event tracked: {event_result}")


async def on_bag_updated(
    user_id: str,
    email: str,
    profile: Dict[str, Any],
) -> None:
    """
    Called after a user updates their bag/profile.
    
    1. Updates Klaviyo profile properties
    2. Tracks 'Bag Updated' event
    3. If gap detected, also tracks 'Gap Detected' event
    """
    props = build_klaviyo_profile_properties(profile)
    await upsert_profile(user_id, email, profile_properties=props)
    
    # Track bag update
    await track_event(
        event_name="Bag Updated",
        user_id=user_id,
        email=email,
        properties={
            "club_count": len(profile.get("clubs", [])),
            "handicap": profile.get("handicap"),
            "budget_preference": profile.get("budgetSensitivity"),
        },
    )
    
    # Check for gaps and track if found
    gapping = compute_gapping_risk(profile)
    if gapping["hasGap"]:
        await track_event(
            event_name="Gap Detected",
            user_id=user_id,
            email=email,
            properties={
                "gap_type": gapping["gapType"],
                "gap_details": gapping["gapDetails"],
            },
        )


async def on_recommendation_generated(
    user_id: str,
    email: str,
    categories: List[str],
    deal_count: int,
    confidence: str = "medium",
) -> None:
    """
    Called when personalized recommendations are generated.
    """
    await track_event(
        event_name="Recommendation Generated",
        user_id=user_id,
        email=email,
        properties={
            "categories": categories,
            "deal_count": deal_count,
            "confidence": confidence,
        },
    )


async def on_deal_viewed(
    user_id: str,
    email: str,
    deal_id: str,
    deal_title: str,
    deal_category: str,
    deal_price: float,
) -> None:
    """
    Called when a user views a deal detail.
    """
    await track_event(
        event_name="Deal Viewed",
        user_id=user_id,
        email=email,
        properties={
            "deal_id": deal_id,
            "deal_title": deal_title,
            "deal_category": deal_category,
            "deal_price": deal_price,
        },
        value=deal_price,
    )


async def on_deal_clicked(
    user_id: str,
    email: str,
    deal_id: str,
    deal_title: str,
    deal_category: str,
    deal_price: float,
    retailer: str,
) -> None:
    """
    Called when a user clicks through to a deal (affiliate link).
    """
    await track_event(
        event_name="Deal Clicked",
        user_id=user_id,
        email=email,
        properties={
            "deal_id": deal_id,
            "deal_title": deal_title,
            "deal_category": deal_category,
            "deal_price": deal_price,
            "retailer": retailer,
        },
        value=deal_price,
    )
