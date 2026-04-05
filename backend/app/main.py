"""
ACIAS — FastAPI Main Application
Production-grade setup: CORS, routers, health, startup events.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime
import logging

from app.core.config import settings
from app.api import customers, segments, actions, inference, monitoring, chatbot, dashboard

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("acias")


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 ACIAS starting up — pre-generating synthetic dataset …")
    # Force dataset generation on startup
    from app.data.data_loader import CUSTOMERS
    logger.info(f"✅ Dataset ready: {len(CUSTOMERS)} customer profiles loaded")
    logger.info(f"✅ Environment: {settings.environment} | Debug: {settings.debug}")
    yield
    logger.info("🛑 ACIAS shutting down")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "ACIAS — AI Customer Intelligence & Action System. "
        "Production-grade ML platform for churn prediction, CLV modeling, "
        "customer segmentation, and automated action recommendations."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = settings.api_prefix

app.include_router(customers.router, prefix=PREFIX)
app.include_router(segments.router, prefix=PREFIX)
app.include_router(actions.router, prefix=PREFIX)
app.include_router(inference.router, prefix=PREFIX)
app.include_router(monitoring.router, prefix=PREFIX)
app.include_router(chatbot.router, prefix=PREFIX)
app.include_router(dashboard.router, prefix=PREFIX)


# ── Root / Health ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "system": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "environment": settings.environment,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    from app.data.data_loader import CUSTOMERS
    return JSONResponse(content={
        "status": "healthy",
        "version": settings.app_version,
        "customers_loaded": len(CUSTOMERS),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": {
            "api": "up",
            "ml_engine": "up",
            "are_engine": "up",
            "chatbot": "up",
        },
    })


@app.get("/api/v1/status", tags=["Health"])
async def api_status():
    return {
        "api_version": "v1",
        "endpoints": [
            "/api/v1/dashboard/kpis",
            "/api/v1/customers",
            "/api/v1/segments",
            "/api/v1/actions",
            "/api/v1/inference/churn",
            "/api/v1/inference/clv",
            "/api/v1/monitoring/dashboard",
            "/api/v1/chatbot/chat",
        ],
    }
