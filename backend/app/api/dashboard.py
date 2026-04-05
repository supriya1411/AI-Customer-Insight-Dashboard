"""
ACIAS — Dashboard / KPI API Routes
"""
from fastapi import APIRouter
from app.data.data_loader import get_kpi_summary, get_all_customers
from app.schemas.schemas import KPISummary
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=KPISummary)
async def get_kpis():
    return KPISummary(**get_kpi_summary())


@router.get("/churn-trend")
async def churn_trend() -> List[Dict[str, Any]]:
    """Simulated 12-week churn probability trend."""
    base = 5.2
    result = []
    now = datetime.utcnow()
    for i in range(12, 0, -1):
        date = now - timedelta(weeks=i)
        val = round(base + random.gauss(0, 0.3) - (i * 0.04), 2)
        result.append({"week": date.strftime("W%W"), "churn_rate": max(2.5, val)})
    return result


@router.get("/mrr-trend")
async def mrr_trend() -> List[Dict[str, Any]]:
    """Simulated 12-month MRR trend."""
    customers = get_all_customers()
    total_mrr = sum(c["mrr"] for c in customers)
    result = []
    now = datetime.utcnow()
    mrr = total_mrr * 0.76
    for i in range(12, 0, -1):
        date = now - timedelta(days=i * 30)
        mrr = mrr * random.uniform(1.02, 1.05)
        result.append({
            "month": date.strftime("%b %Y"),
            "mrr": round(mrr, 2),
            "mrr_at_risk": round(mrr * random.uniform(0.12, 0.18), 2),
        })
    return result


@router.get("/action-performance")
async def action_performance() -> List[Dict[str, Any]]:
    """Last 30 days action completion rate by type."""
    actions = [
        {"action": "CSM Priority Call", "triggered": 48, "completed": 39, "success_rate": 81.2, "avg_revenue_saved": 4200},
        {"action": "Re-engagement Email", "triggered": 124, "completed": 87, "success_rate": 70.2, "avg_revenue_saved": 1800},
        {"action": "Retention Discount", "triggered": 67, "completed": 51, "success_rate": 76.1, "avg_revenue_saved": 3100},
        {"action": "Onboarding Boost", "triggered": 89, "completed": 58, "success_rate": 65.2, "avg_revenue_saved": 800},
        {"action": "Expansion Upsell", "triggered": 42, "completed": 31, "success_rate": 73.8, "avg_revenue_saved": 5600},
        {"action": "NPS Recovery", "triggered": 35, "completed": 24, "success_rate": 68.6, "avg_revenue_saved": 2200},
        {"action": "Billing Intervention", "triggered": 28, "completed": 26, "success_rate": 92.9, "avg_revenue_saved": 1400},
    ]
    return actions


@router.get("/segment-health")
async def segment_health() -> List[Dict[str, Any]]:
    from app.data.data_loader import get_segment_summary
    return get_segment_summary()


@router.get("/nrr-trend")
async def nrr_trend() -> List[Dict[str, Any]]:
    result = []
    now = datetime.utcnow()
    nrr = 98.4
    for i in range(12, 0, -1):
        date = now - timedelta(days=i * 30)
        nrr = nrr + random.uniform(0.3, 0.7)
        result.append({"month": date.strftime("%b %Y"), "nrr": round(nrr, 2)})
    return result
