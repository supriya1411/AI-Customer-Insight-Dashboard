"""
ACIAS — Monitoring API Routes
Model health, drift detection, and champion-challenger status.
"""
from fastapi import APIRouter
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


def _make_model_metric(
    name: str, auc: float, precision: float, recall: float, f1: float,
    mae: Optional[float], psi: float, status: str, last_retrain_days: int,
    next_retrain_days: int, predictions: int, drift: bool
) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "model_name": name,
        "auc_roc": auc,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "mae": mae,
        "psi": psi,
        "status": status,
        "last_retrain": (now - timedelta(days=last_retrain_days)).strftime("%Y-%m-%d"),
        "next_retrain": (now + timedelta(days=next_retrain_days)).strftime("%Y-%m-%d"),
        "predictions_today": predictions,
        "drift_detected": drift,
    }


MOCK_MODELS = [
    _make_model_metric("Churn Prediction (XGBoost)", 0.921, 0.847, 0.783, 0.814, None, 0.08, "healthy", 3, 4, 4821, False),
    _make_model_metric("CLV Prediction (BG/NBD)", 0.0, 0.0, 0.0, 0.0, 87.2, 0.12, "healthy", 7, 21, 1205, False),
    _make_model_metric("Segmentation (K-Means)", 0.0, 0.0, 0.0, 0.0, None, 0.06, "healthy", 14, 14, 500, False),
    _make_model_metric("Sentiment (BERT)", 0.883, 0.871, 0.856, 0.863, None, 0.14, "healthy", 21, 7, 2340, False),
    _make_model_metric("Intent Classifier (DistilBERT)", 0.912, 0.895, 0.887, 0.891, None, 0.09, "healthy", 10, 18, 891, False),
    _make_model_metric("Contextual Bandit (VW)", 0.0, 0.0, 0.0, 0.0, None, 0.21, "degraded", 5, 2, 3102, True),
]


@router.get("/dashboard")
async def monitoring_dashboard() -> Dict[str, Any]:
    total_predictions = sum(m["predictions_today"] for m in MOCK_MODELS)
    return {
        "models": MOCK_MODELS,
        "total_predictions_today": total_predictions,
        "avg_latency_ms": 47.3,
        "error_rate": 0.0012,
        "champion_challenger_active": True,
        "last_updated": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/drift")
async def drift_report() -> Dict[str, Any]:
    features_psi = {
        "feature_usage_score": 0.08,
        "login_frequency_30d": 0.11,
        "support_tickets_30d": 0.14,
        "api_calls_30d": 0.07,
        "billing_failures_30d": 0.19,
        "nps_score": 0.06,
        "session_duration_avg": 0.09,
        "expansion_events": 0.13,
    }
    return {
        "overall_psi": 0.21,
        "alert_threshold": 0.25,
        "status": "healthy",
        "feature_psi": features_psi,
        "drifted_features": [k for k, v in features_psi.items() if v > 0.20],
        "last_checked": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/champion-challenger")
async def champion_challenger_status() -> Dict[str, Any]:
    return {
        "active": True,
        "champion": {
            "model_id": "xgb-v2.1-prod",
            "auc_roc": 0.921,
            "f1_score": 0.814,
            "action_success_rate": 0.673,
            "deployed_date": (datetime.utcnow() - timedelta(days=14)).strftime("%Y-%m-%d"),
        },
        "challenger": {
            "model_id": "xgb-v2.2-challenger",
            "auc_roc": 0.934,
            "f1_score": 0.829,
            "action_success_rate": 0.701,
            "shadow_start_date": (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d"),
            "days_remaining": 4,
        },
        "auto_promote_if_better": True,
        "promotion_criteria": "F1 + action_success_rate both exceed champion",
        "projected_promotion_date": (datetime.utcnow() + timedelta(days=4)).strftime("%Y-%m-%d"),
    }


@router.get("/latency")
async def latency_metrics() -> List[Dict[str, Any]]:
    """Last 24h latency data per model."""
    models = ["Churn (XGBoost)", "CLV (BG/NBD)", "Segmentation", "Sentiment (BERT)"]
    result = []
    for model in models:
        base = random.uniform(25, 120)
        result.append({
            "model": model,
            "p50_ms": round(base, 1),
            "p95_ms": round(base * 1.8, 1),
            "p99_ms": round(base * 3.2, 1),
            "avg_ms": round(base * 1.1, 1),
            "requests_per_minute": random.randint(50, 400),
        })
    return result
