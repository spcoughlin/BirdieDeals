from fastapi import APIRouter, Depends, BackgroundTasks
from typing import List, Dict, Any, Tuple

from ..models import (
    FeaturedDealsResponse,
    SuggestedDealsResponse,
    Deal,
    DealViewRequest,
    DealClickRequest,
)
from ..deps import get_current_user
from ..deals_data import FEATURED_DEALS, get_deal_by_id
from ..klaviyo import (
    on_recommendation_generated,
    on_deal_viewed,
    on_deal_clicked,
    compute_wedge_wear_risk,
    compute_gapping_risk,
)

router = APIRouter(prefix="/api/deals", tags=["deals"])


@router.get("/featured", response_model=FeaturedDealsResponse)
async def featured_deals():
    """Public endpoint - returns generic deals for browsing."""
    return FeaturedDealsResponse(deals=FEATURED_DEALS)


def _profile_summary(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Extract key profile fields for the response."""
    return {
        "handicap": profile.get("handicap"),
        "driverCarry": profile.get("driverCarry"),
        "sevenIronCarry": profile.get("sevenIronCarry"),
        "roundsPerMonth": profile.get("roundsPerMonth"),
        "monthsPlayedPerYear": profile.get("monthsPlayedPerYear"),
        "budgetSensitivity": profile.get("budgetSensitivity"),
        "willingToBuyUsed": profile.get("willingToBuyUsed"),
        "clubCount": len(profile.get("clubs", [])),
    }


def _suggest_deals(profile: Dict[str, Any]) -> Tuple[List[Deal], str, List[str]]:
    """
    Generate personalized deal recommendations based on golfer profile.
    
    Returns:
        (deals, reasoning, categories)
    """
    budget = (profile.get("budgetSensitivity") or "Balanced").lower()
    wants_used = bool(profile.get("willingToBuyUsed", False))
    handicap = profile.get("handicap")
    rounds_per_month = profile.get("roundsPerMonth") or 0
    driver_carry = profile.get("driverCarry")
    
    picks: List[Deal] = []
    reasons: List[str] = []
    categories: List[str] = []
    
    # Compute risk scores
    wedge_risk = compute_wedge_wear_risk(profile)
    gapping = compute_gapping_risk(profile)
    
    # --- Wedge recommendations based on wear risk ---
    if wedge_risk == "high":
        wedges = [d for d in FEATURED_DEALS if d.category == "wedges"]
        if wedges:
            # Prefer value options for value-first players
            if "value" in budget:
                wedge = next((w for w in wedges if "value" in (w.tags or [])), wedges[0])
            else:
                wedge = wedges[0]
            wedge_copy = wedge.model_copy()
            wedge_copy.matchScore = 0.9
            wedge_copy.matchReason = "High wedge wear risk - you play frequently"
            picks.append(wedge_copy)
            categories.append("wedges")
            reasons.append("frequent play means wedge grooves wear faster")
    
    # --- Gap-based recommendations ---
    if gapping["hasGap"]:
        gap_type = gapping["gapType"]
        
        if gap_type == "top-of-bag":
            # Recommend hybrids or fairway woods
            hybrids = [d for d in FEATURED_DEALS if d.category in ("hybrids", "fairway")]
            if hybrids:
                pick = hybrids[0].model_copy()
                pick.matchScore = 0.85
                pick.matchReason = f"Detected {gapping['gapDetails']}"
                picks.append(pick)
                categories.append(pick.category)
                reasons.append("gap at the top of your bag")
        
        elif gap_type == "mid-bag":
            # Recommend irons or utility clubs
            irons = [d for d in FEATURED_DEALS if d.category == "irons"]
            if irons:
                pick = irons[0].model_copy()
                pick.matchScore = 0.8
                pick.matchReason = f"Detected {gapping['gapDetails']}"
                picks.append(pick)
                categories.append("irons")
                reasons.append("mid-bag yardage gap")
    
    # --- Budget and used preferences ---
    if "value" in budget or wants_used:
        # Include used driver deal if they want value
        drivers = [d for d in FEATURED_DEALS if d.category == "driver" and "used" in (d.tags or [])]
        if drivers and "driver" not in categories:
            driver = drivers[0].model_copy()
            driver.matchScore = 0.75
            driver.matchReason = "Great value on a quality used driver"
            picks.append(driver)
            categories.append("driver")
            reasons.append("value-first preference")
    
    # --- Distance seekers ---
    if driver_carry and driver_carry < 220:
        # They might benefit from a more forgiving driver
        forgiving = [d for d in FEATURED_DEALS if d.category == "driver" and "forgiving" in (d.tags or [])]
        if forgiving and not any(p.category == "driver" for p in picks):
            driver = forgiving[0].model_copy()
            driver.matchScore = 0.7
            driver.matchReason = "Forgiving driver could help with distance"
            picks.append(driver)
            categories.append("driver")
            reasons.append("potential distance gains")
    
    # --- Everyone gets a ball deal for demo purposes ---
    ball_deals = [d for d in FEATURED_DEALS if d.category == "balls"]
    if ball_deals and "balls" not in categories:
        ball = ball_deals[0].model_copy()
        ball.matchScore = 0.6
        ball.matchReason = "Great value on premium balls"
        picks.append(ball)
        categories.append("balls")
    
    # --- High handicappers might want game improvement irons ---
    if handicap is not None and handicap >= 15:
        gi_irons = [d for d in FEATURED_DEALS if d.category == "irons" and "game-improvement" in (d.tags or [])]
        if gi_irons and not any(p.category == "irons" for p in picks):
            iron = gi_irons[0].model_copy()
            iron.matchScore = 0.65
            iron.matchReason = "Game improvement irons for your handicap level"
            picks.append(iron)
            categories.append("irons")
            reasons.append("handicap-appropriate equipment")
    
    # --- Frequent players might want apparel deals ---
    if rounds_per_month >= 6:
        apparel = [d for d in FEATURED_DEALS if d.category == "apparel"]
        if apparel:
            pick = apparel[0].model_copy()
            pick.matchScore = 0.5
            pick.matchReason = "You play often - quality gear matters"
            picks.append(pick)
            categories.append("apparel")
    
    # Build reasoning string
    if reasons:
        reasoning = f"Personalized for you based on: {', '.join(reasons)}."
    else:
        reasoning = "Here are some deals we think you'll like."
    
    if handicap is not None:
        reasoning = f"Handicap {handicap} golfer. {reasoning}"
    
    # De-dupe by id and sort by match score
    unique = []
    seen = set()
    for d in picks:
        if d.id not in seen:
            unique.append(d)
            seen.add(d.id)
    
    unique.sort(key=lambda d: d.matchScore or 0, reverse=True)
    
    return unique, reasoning, list(set(categories))


@router.get("/suggested", response_model=SuggestedDealsResponse)
async def suggested_deals(
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    """
    Returns personalized deals based on the user's golf profile.
    
    Also computes risk scores and gap analysis for the response.
    """
    profile = user.get("profile", {}) or {}
    deals, reasoning, categories = _suggest_deals(profile)
    
    # Compute analysis for response
    gapping = compute_gapping_risk(profile)
    wedge_risk = compute_wedge_wear_risk(profile)
    
    risk_scores = {
        "wedgeWearRisk": wedge_risk,
    }
    
    # Track recommendation event in Klaviyo
    if deals:
        background_tasks.add_task(
            on_recommendation_generated,
            user_id=user["_id"],
            email=user["email"],
            categories=categories,
            deal_count=len(deals),
            confidence="high" if any(d.matchScore and d.matchScore >= 0.8 for d in deals) else "medium",
        )
    
    return SuggestedDealsResponse(
        deals=deals,
        reasoning=reasoning,
        profileSummary=_profile_summary(profile),
        gappingAnalysis=gapping if gapping["hasGap"] else None,
        riskScores=risk_scores,
    )


# -----------------------------------------------------------------------------
# Event tracking endpoints
# -----------------------------------------------------------------------------


@router.post("/view")
async def track_deal_view(
    body: DealViewRequest,
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    """Track when a user views a deal."""
    deal = get_deal_by_id(body.dealId)
    if deal:
        background_tasks.add_task(
            on_deal_viewed,
            user_id=user["_id"],
            email=user["email"],
            deal_id=deal.id,
            deal_title=deal.title,
            deal_category=deal.category,
            deal_price=deal.price,
        )
    return {"ok": True}


@router.post("/click")
async def track_deal_click(
    body: DealClickRequest,
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    """Track when a user clicks through to a deal (affiliate link)."""
    deal = get_deal_by_id(body.dealId)
    if deal:
        background_tasks.add_task(
            on_deal_clicked,
            user_id=user["_id"],
            email=user["email"],
            deal_id=deal.id,
            deal_title=deal.title,
            deal_category=deal.category,
            deal_price=deal.price,
            retailer=deal.retailer,
        )
    return {"ok": True, "url": deal.url if deal else None}
