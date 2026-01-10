from typing import Optional
from .models import Deal

FEATURED_DEALS = [
    # Wedges
    Deal(
        id="d1",
        title="Cleveland RTX ZipCore Wedge (Last Gen)",
        brand="Cleveland",
        category="wedges",
        price=109.99,
        originalPrice=149.99,
        retailer="GlobalGolf",
        url="https://example.com/deal/wedge",
        imageUrl="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
        tags=["value", "last-gen", "spin"],
        expiresAt=None,
    ),
    Deal(
        id="d10",
        title="Titleist Vokey SM9 Wedge",
        brand="Titleist",
        category="wedges",
        price=159.99,
        originalPrice=179.99,
        retailer="Golf Galaxy",
        url="https://example.com/deal/vokey",
        imageUrl="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
        tags=["premium", "spin", "tour"],
        expiresAt=None,
    ),
    
    # Drivers
    Deal(
        id="d2",
        title="Callaway Mavrik Driver (Used - Very Good)",
        brand="Callaway",
        category="driver",
        price=179.99,
        originalPrice=399.99,
        retailer="Callaway Pre-Owned",
        url="https://example.com/deal/driver",
        imageUrl="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400",
        tags=["used", "forgiving", "value"],
        expiresAt=None,
    ),
    Deal(
        id="d11",
        title="TaylorMade Stealth 2 Driver",
        brand="TaylorMade",
        category="driver",
        price=449.99,
        originalPrice=599.99,
        retailer="TaylorMade",
        url="https://example.com/deal/stealth2",
        imageUrl="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400",
        tags=["new", "distance", "premium"],
        expiresAt=None,
    ),
    
    # Balls
    Deal(
        id="d3",
        title="Titleist Pro V1 Practice Balls (Dozen)",
        brand="Titleist",
        category="balls",
        price=29.99,
        originalPrice=49.99,
        retailer="LostGolfBalls",
        url="https://example.com/deal/balls",
        imageUrl="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400",
        tags=["practice", "value"],
        expiresAt=None,
    ),
    Deal(
        id="d12",
        title="Kirkland Signature Golf Balls (2 Dozen)",
        brand="Kirkland",
        category="balls",
        price=27.99,
        originalPrice=34.99,
        retailer="Costco",
        url="https://example.com/deal/kirkland",
        imageUrl="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400",
        tags=["value", "3-piece"],
        expiresAt=None,
    ),
    
    # Hybrids
    Deal(
        id="d4",
        title="Ping G430 Hybrid",
        brand="Ping",
        category="hybrids",
        price=229.99,
        originalPrice=279.99,
        retailer="Golf Galaxy",
        url="https://example.com/deal/hybrid",
        imageUrl="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
        tags=["forgiving", "versatile"],
        expiresAt=None,
    ),
    Deal(
        id="d13",
        title="Callaway Paradym Hybrid (Used)",
        brand="Callaway",
        category="hybrids",
        price=149.99,
        originalPrice=299.99,
        retailer="Callaway Pre-Owned",
        url="https://example.com/deal/paradym-hybrid",
        imageUrl="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
        tags=["used", "value", "forgiving"],
        expiresAt=None,
    ),
    
    # Fairway Woods
    Deal(
        id="d5",
        title="Cobra LTDx 3 Wood",
        brand="Cobra",
        category="fairway",
        price=199.99,
        originalPrice=349.99,
        retailer="Rock Bottom Golf",
        url="https://example.com/deal/fairway",
        imageUrl="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400",
        tags=["value", "distance", "last-gen"],
        expiresAt=None,
    ),
    
    # Irons
    Deal(
        id="d6",
        title="Callaway Rogue ST Max Irons (5-PW)",
        brand="Callaway",
        category="irons",
        price=699.99,
        originalPrice=999.99,
        retailer="Golf Galaxy",
        url="https://example.com/deal/irons",
        imageUrl="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
        tags=["game-improvement", "forgiving", "distance"],
        expiresAt=None,
    ),
    Deal(
        id="d14",
        title="TaylorMade P790 Irons (Used)",
        brand="TaylorMade",
        category="irons",
        price=599.99,
        originalPrice=1299.99,
        retailer="2nd Swing",
        url="https://example.com/deal/p790",
        imageUrl="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
        tags=["used", "player", "value"],
        expiresAt=None,
    ),
    
    # Putters
    Deal(
        id="d7",
        title="Odyssey White Hot OG #1 Putter",
        brand="Odyssey",
        category="putter",
        price=179.99,
        originalPrice=249.99,
        retailer="Golf Galaxy",
        url="https://example.com/deal/putter",
        imageUrl="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
        tags=["blade", "feel", "classic"],
        expiresAt=None,
    ),
    Deal(
        id="d15",
        title="Cleveland Huntington Beach Putter",
        brand="Cleveland",
        category="putter",
        price=99.99,
        originalPrice=149.99,
        retailer="Amazon",
        url="https://example.com/deal/hb-putter",
        imageUrl="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
        tags=["value", "mallet", "forgiving"],
        expiresAt=None,
    ),
    
    # Apparel
    Deal(
        id="d8",
        title="FootJoy Pro SL Golf Shoes",
        brand="FootJoy",
        category="apparel",
        price=129.99,
        originalPrice=169.99,
        retailer="FootJoy",
        url="https://example.com/deal/shoes",
        imageUrl="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400",
        tags=["shoes", "comfort", "spikeless"],
        expiresAt=None,
    ),
    Deal(
        id="d16",
        title="Under Armour Golf Polo (3-Pack)",
        brand="Under Armour",
        category="apparel",
        price=79.99,
        originalPrice=119.99,
        retailer="UA Outlet",
        url="https://example.com/deal/polos",
        imageUrl="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400",
        tags=["value", "bundle", "moisture-wicking"],
        expiresAt=None,
    ),
    
    # Accessories
    Deal(
        id="d9",
        title="Bushnell Tour V5 Rangefinder",
        brand="Bushnell",
        category="accessories",
        price=299.99,
        originalPrice=399.99,
        retailer="Amazon",
        url="https://example.com/deal/rangefinder",
        imageUrl="https://images.unsplash.com/photo-1591491634056-276cc0c0e20b?w=400",
        tags=["rangefinder", "tech", "accuracy"],
        expiresAt=None,
    ),
    Deal(
        id="d17",
        title="Sun Mountain 2.5+ Stand Bag",
        brand="Sun Mountain",
        category="accessories",
        price=189.99,
        originalPrice=249.99,
        retailer="Golf Galaxy",
        url="https://example.com/deal/bag",
        imageUrl="https://images.unsplash.com/photo-1591491634056-276cc0c0e20b?w=400",
        tags=["bag", "lightweight", "stand"],
        expiresAt=None,
    ),
]


def get_deal_by_id(deal_id: str) -> Optional[Deal]:
    """Look up a deal by ID."""
    for deal in FEATURED_DEALS:
        if deal.id == deal_id:
            return deal
    return None


def get_deals_by_category(category: str) -> list[Deal]:
    """Get all deals in a category."""
    return [d for d in FEATURED_DEALS if d.category == category]


def get_deals_by_tag(tag: str) -> list[Deal]:
    """Get all deals with a specific tag."""
    return [d for d in FEATURED_DEALS if tag in (d.tags or [])]
