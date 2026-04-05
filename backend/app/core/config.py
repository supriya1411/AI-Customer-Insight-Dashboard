"""
ACIAS — Core Configuration
Pydantic-settings based config with sensible defaults for local dev.
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────
    app_name: str = "ACIAS — AI Customer Intelligence & Action System"
    app_version: str = "3.0.0"
    debug: bool = Field(default=True, env="DEBUG")
    environment: str = Field(default="development", env="ENVIRONMENT")

    # ── API ──────────────────────────────────────────────────────────
    api_prefix: str = "/api/v1"
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]
    gemini_api_key: str = Field(default="", env="GEMINI_API_KEY")

    # ── Database ──────────────────────────────────────────────────────
    database_url: str = Field(
        default="sqlite+aiosqlite:///./acias.db", env="DATABASE_URL"
    )

    # ── Redis ──────────────────────────────────────────────────────────
    redis_url: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    # ── MLflow ──────────────────────────────────────────────────────────
    mlflow_tracking_uri: str = Field(
        default="./mlruns", env="MLFLOW_TRACKING_URI"
    )

    # ── ML Thresholds ─────────────────────────────────────────────────
    churn_alert_threshold: float = 0.70
    churn_high_risk_threshold: float = 0.50
    clv_high_tier_threshold: float = 10000.0
    clv_mid_tier_threshold: float = 3000.0
    psi_alert_threshold: float = 0.25

    # ── Feature Flags ─────────────────────────────────────────────────
    use_real_ml_models: bool = Field(default=False, env="USE_REAL_ML_MODELS")
    use_redis_cache: bool = Field(default=False, env="USE_REDIS_CACHE")
    use_mlflow: bool = Field(default=False, env="USE_MLFLOW")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
