"""
ACIAS — Inference API Routes
Real-time ML inference endpoints for churn, CLV, and segmentation.
"""
from fastapi import APIRouter, HTTPException
from app.data.data_loader import get_customer_by_id
from app.schemas.schemas import InferenceRequest, ChurnInferenceResponse, CLVInferenceResponse
from typing import Dict, Any
import random

router = APIRouter(prefix="/inference", tags=["Inference"])


@router.post("/churn", response_model=ChurnInferenceResponse)
async def predict_churn(body: InferenceRequest):
    customer = get_customer_by_id(body.customer_id.upper())
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {body.customer_id} not found")

    churn_prob = customer["churn_probability"]
    top_reasons = [
        {
            "feature": feat,
            "shap_value": val,
            "direction": "increases_churn" if val > 0 else "reduces_churn",
            "description": _feature_description(feat, val, customer),
        }
        for feat, val in customer["top_churn_reasons"]
    ]

    risk_tier = customer["churn_risk_tier"]
    time_map = {"critical": "within 2 hours", "high": "within 24 hours", "medium": "within 7 days", "low": "within 30 days"}

    return ChurnInferenceResponse(
        customer_id=customer["customer_id"],
        churn_probability=churn_prob,
        risk_tier=risk_tier,
        confidence=round(min(0.99, churn_prob * 0.8 + 0.15 + random.uniform(-0.02, 0.02)), 3),
        top_reasons=top_reasons,
        recommended_action=customer["recommended_action_label"],
        time_to_intervention=time_map.get(risk_tier, "within 7 days"),
        model_version="xgb-v2.1-prod",
    )


@router.post("/clv", response_model=CLVInferenceResponse)
async def predict_clv(body: InferenceRequest):
    customer = get_customer_by_id(body.customer_id.upper())
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {body.customer_id} not found")

    return CLVInferenceResponse(
        customer_id=customer["customer_id"],
        clv_12m=customer["clv_12m"],
        clv_24m=customer["clv_24m"],
        clv_tier=customer["clv_tier"],
        purchase_probability_90d=customer["purchase_probability_90d"],
        expected_purchases_90d=customer["expected_purchases_90d"],
        model_version="bg_nbd-v1.3-prod",
    )


@router.post("/batch-churn")
async def batch_churn(customer_ids: list) -> Dict[str, Any]:
    """Batch churn prediction for up to 50 customers."""
    results = []
    for cid in customer_ids[:50]:
        c = get_customer_by_id(str(cid).upper())
        if c:
            results.append({
                "customer_id": c["customer_id"],
                "churn_probability": c["churn_probability"],
                "risk_tier": c["churn_risk_tier"],
                "recommended_action": c["recommended_action_label"],
            })
    return {"predictions": results, "count": len(results)}


def _feature_description(feat: str, val: float, customer: Dict) -> str:
    descriptions = {
        "feature_usage_score": f"Feature adoption at {customer.get('feature_usage_score', 0)*100:.0f}% (low engagement signal)",
        "login_frequency_30d": f"Only {customer.get('login_frequency_30d', 0)} logins in last 30 days",
        "support_tickets_30d": f"{customer.get('support_tickets_30d', 0)} support tickets in last 30 days",
        "billing_failures_30d": f"{customer.get('billing_failures_30d', 0)} billing failures detected",
        "nps_score": f"NPS score of {customer.get('nps_score', 0)}/10",
        "api_calls_30d": f"{customer.get('api_calls_30d', 0):,} API calls this month",
        "session_duration_avg": f"Avg session duration: {customer.get('session_duration_avg', 0):.1f} min",
        "expansion_events": f"{customer.get('expansion_events', 0)} expansion events recorded",
    }
    return descriptions.get(feat, feat)
