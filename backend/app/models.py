from pydantic import BaseModel, EmailStr, Field
from typing import Any, Optional, List, Dict, Literal


# -----------------------------------------------------------------------------
# Golf-specific schemas
# -----------------------------------------------------------------------------


class Club(BaseModel):
    """Represents a single club in the golfer's bag."""
    name: str  # e.g., "Driver", "7 Iron", "56° Wedge"
    brand: Optional[str] = None
    model: Optional[str] = None
    loft: Optional[float] = None  # degrees
    carryYards: Optional[int] = None  # typical carry distance
    totalYards: Optional[int] = None  # with roll
    usage: Optional[Literal["primary", "backup", "situational"]] = "primary"


class GolferProfile(BaseModel):
    """
    Complete golfer profile for bag setup and personalization.
    
    This is stored in MongoDB and synced to Klaviyo.
    """
    # Player info
    handicap: Optional[float] = None
    driverCarry: Optional[int] = None  # yards
    sevenIronCarry: Optional[int] = None  # yards
    
    # Play frequency
    roundsPerMonth: Optional[int] = None
    monthsPlayedPerYear: Optional[int] = None
    region: Optional[str] = None  # e.g., "Northeast", "Southwest"
    
    # Preferences
    budgetSensitivity: Optional[Literal["Value-First", "Balanced", "Performance-First"]] = "Balanced"
    willingToBuyUsed: Optional[bool] = False
    preferredBrands: Optional[List[str]] = None
    
    # Bag setup
    clubs: Optional[List[Club]] = None
    
    # Optional extras
    playStyle: Optional[str] = None  # e.g., "aggressive", "conservative"
    goals: Optional[List[str]] = None  # e.g., ["lower handicap", "more distance"]


# -----------------------------------------------------------------------------
# Deal models
# -----------------------------------------------------------------------------


class Deal(BaseModel):
    """A deal/offer from the marketplace."""
    id: str
    title: str
    brand: str
    category: str  # wedges, driver, irons, hybrids, balls, putter, apparel, accessories
    price: float
    originalPrice: Optional[float] = None
    retailer: str
    url: str
    imageUrl: Optional[str] = None
    tags: Optional[List[str]] = None
    expiresAt: Optional[str] = None
    
    # Recommendation metadata (set by backend)
    matchScore: Optional[float] = None  # 0-1, how well it matches profile
    matchReason: Optional[str] = None  # why this was recommended


# -----------------------------------------------------------------------------
# Request/Response models
# -----------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    username: str = Field(min_length=2, max_length=32)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    profile: Dict[str, Any] = Field(default_factory=dict)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdateRequest(BaseModel):
    profile: Dict[str, Any] = Field(default_factory=dict)


class UserPublic(BaseModel):
    id: str
    username: str
    email: EmailStr
    profile: Dict[str, Any] = Field(default_factory=dict)


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class MeResponse(BaseModel):
    user: UserPublic


class FeaturedDealsResponse(BaseModel):
    deals: List[Deal]


class SuggestedDealsResponse(BaseModel):
    deals: List[Deal]
    reasoning: Optional[str] = None
    profileSummary: Optional[Dict[str, Any]] = None
    gappingAnalysis: Optional[Dict[str, Any]] = None  # gap detection results
    riskScores: Optional[Dict[str, Any]] = None  # wedge wear, etc.


# -----------------------------------------------------------------------------
# Event tracking requests (optional, for explicit tracking)
# -----------------------------------------------------------------------------


class DealViewRequest(BaseModel):
    dealId: str


class DealClickRequest(BaseModel):
    dealId: str
