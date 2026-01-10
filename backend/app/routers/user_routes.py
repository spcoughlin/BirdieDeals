from fastapi import APIRouter, Depends, BackgroundTasks
from datetime import datetime, timezone

from ..deps import get_current_user
from ..models import MeResponse, UserPublic, ProfileUpdateRequest
from ..db import get_db
from ..klaviyo import on_bag_updated

router = APIRouter(prefix="/api", tags=["user"])


@router.get("/me", response_model=MeResponse)
async def me(user=Depends(get_current_user)):
    user_public = UserPublic(
        id=user["_id"],
        username=user["username"],
        email=user["email"],
        profile=user.get("profile", {}),
    )
    return MeResponse(user=user_public)


@router.post("/profile", response_model=MeResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    db = get_db()
    new_profile = body.profile or {}
    now = datetime.now(timezone.utc)

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"profile": new_profile, "updated_at": now}},
    )

    updated = await db.users.find_one({"_id": user["_id"]})
    user_public = UserPublic(
        id=updated["_id"],
        username=updated["username"],
        email=updated["email"],
        profile=updated.get("profile", {}),
    )
    
    # Sync to Klaviyo in background
    background_tasks.add_task(
        on_bag_updated,
        user_id=updated["_id"],
        email=updated["email"],
        profile=new_profile,
    )
    
    return MeResponse(user=user_public)
