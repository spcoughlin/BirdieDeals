from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from uuid import uuid4
from datetime import datetime, timezone
import logging

from ..db import get_db
from ..models import RegisterRequest, LoginRequest, AuthResponse, UserPublic
from ..auth import hash_password, verify_password, create_access_token
from ..klaviyo import on_account_created

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest, background_tasks: BackgroundTasks):
    logger.info(f"[REGISTER] Received registration request: username={body.username}, email={body.email}")
    logger.info(f"[REGISTER] Profile data: {body.profile}")
    
    db = get_db()
    logger.info("[REGISTER] Checking for existing email")
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        logger.warning(f"[REGISTER] Email already exists: {body.email}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    logger.info("[REGISTER] Creating new user document")
    now = datetime.now(timezone.utc)
    user_id = str(uuid4())
    doc = {
        "_id": user_id,
        "username": body.username,
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "profile": body.profile or {},
        "created_at": now,
        "updated_at": now,
    }
    logger.info(f"[REGISTER] Inserting user to MongoDB: {user_id}")
    await db.users.insert_one(doc)
    logger.info(f"[REGISTER] User inserted successfully: {user_id}")

    token = create_access_token(subject=user_id)
    user_public = UserPublic(
        id=user_id,
        username=doc["username"],
        email=doc["email"],
        profile=doc["profile"],
    )
    
    logger.info(f"[REGISTER] Queueing Klaviyo sync task for user: {user_id}")
    # Sync to Klaviyo in background (non-blocking)
    background_tasks.add_task(
        on_account_created,
        user_id=user_id,
        email=doc["email"],
        username=doc["username"],
        profile=doc["profile"],
    )
    
    logger.info(f"[REGISTER] Registration complete for user: {user_id}")
    return AuthResponse(token=token, user=user_public)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    logger.info(f"[LOGIN] Login attempt for: {body.email}")
    db = get_db()
    user = await db.users.find_one({"email": body.email.lower()})
    if not user:
        logger.warning(f"[LOGIN] User not found: {body.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(body.password, user.get("password_hash", "")):
        logger.warning(f"[LOGIN] Invalid password for user: {body.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=user["_id"])
    user_public = UserPublic(
        id=user["_id"],
        username=user["username"],
        email=user["email"],
        profile=user.get("profile", {}),
    )
    logger.info(f"[LOGIN] Login successful for user: {user['_id']}")
    return AuthResponse(token=token, user=user_public)
