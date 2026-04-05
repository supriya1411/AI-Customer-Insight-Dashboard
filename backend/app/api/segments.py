"""
ACIAS — Segments API Routes
"""
from fastapi import APIRouter
from app.data.data_loader import get_segment_summary, get_all_customers
from app.schemas.schemas import SegmentListResponse, SegmentSummary
from typing import List, Dict, Any

router = APIRouter(prefix="/segments", tags=["Segments"])


@router.get("", response_model=SegmentListResponse)
async def list_segments():
    segments = get_segment_summary()
    return SegmentListResponse(
        segments=[SegmentSummary(**s) for s in segments],
        total=len(segments),
    )


@router.get("/{segment_id}/customers")
async def get_segment_customers(segment_id: str) -> Dict[str, Any]:
    customers = get_all_customers()
    seg_customers = [c for c in customers if c["segment_id"] == segment_id.upper()]
    if not seg_customers:
        return {"customers": [], "total": 0, "segment_id": segment_id}
    return {
        "segment_id": segment_id,
        "segment_name": seg_customers[0]["segment_name"],
        "customers": seg_customers[:50],
        "total": len(seg_customers),
    }


@router.get("/analytics/churn-distribution")
async def churn_distribution() -> List[Dict[str, Any]]:
    """Histogram of churn probability distribution across all customers."""
    customers = get_all_customers()
    buckets = [
        {"range": "0-10%", "min": 0.0, "max": 0.10, "count": 0},
        {"range": "10-30%", "min": 0.10, "max": 0.30, "count": 0},
        {"range": "30-50%", "min": 0.30, "max": 0.50, "count": 0},
        {"range": "50-70%", "min": 0.50, "max": 0.70, "count": 0},
        {"range": "70-85%", "min": 0.70, "max": 0.85, "count": 0},
        {"range": "85-100%", "min": 0.85, "max": 1.01, "count": 0},
    ]
    for c in customers:
        p = c["churn_probability"]
        for b in buckets:
            if b["min"] <= p < b["max"]:
                b["count"] += 1
                break
    return buckets


@router.get("/analytics/clv-by-segment")
async def clv_by_segment() -> List[Dict[str, Any]]:
    segments = get_segment_summary()
    return [
        {
            "segment_name": s["segment_name"],
            "avg_clv_12m": s["avg_clv_12m"],
            "avg_mrr": s["avg_mrr"],
            "customer_count": s["customer_count"],
        }
        for s in segments
    ]
