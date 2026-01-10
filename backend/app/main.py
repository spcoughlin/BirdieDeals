from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import settings
from .routers.auth_routes import router as auth_router
from .routers.user_routes import router as user_router
from .routers.deals_routes import router as deals_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="BirdieDeals API", version="0.1.0")

# Add CORS middleware with origins from config
cors_origins = settings.cors_origins_list()
logger.info(f"[STARTUP] CORS origins from settings: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

logger.info(f"[STARTUP] Registering routers")
logger.info(f"[STARTUP] CORS origins: {settings.cors_origins_list()}")
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(deals_router)
logger.info(f"[STARTUP] All routers registered")


@app.get("/health")
async def health():
    logger.info("[HEALTH] Health check")
    return {"ok": True}
