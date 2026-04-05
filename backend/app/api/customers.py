"""
ACIAS — Customer API Routes
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
from app.data.data_loader import get_all_customers, get_customer_by_id
from app.schemas.schemas import CustomerDetail, CustomerListResponse, CustomerSummary
import math

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("/insights")
async def get_customer_insights():
    from app.services.ml_insights import get_insights
    return get_insights()


@router.get("", response_model=CustomerListResponse)
async def list_customers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    risk_tier: Optional[str] = Query(None),
    segment_id: Optional[str] = Query(None),
    clv_tier: Optional[str] = Query(None),
    plan: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("churn_probability"),
    sort_dir: str = Query("desc"),
):
    customers = get_all_customers()

    # Filters
    if risk_tier:
        customers = [c for c in customers if c["churn_risk_tier"] == risk_tier]
    if segment_id:
        customers = [c for c in customers if c["segment_id"] == segment_id]
    if clv_tier:
        customers = [c for c in customers if c["clv_tier"] == clv_tier]
    if plan:
        customers = [c for c in customers if c["plan"] == plan]
    if search:
        q = search.lower()
        customers = [
            c for c in customers
            if q in c["customer_id"].lower() or q in c["name"].lower() or q in c.get("company", "").lower()
        ]

    # Sort
    reverse = sort_dir == "desc"
    try:
        customers = sorted(customers, key=lambda x: x.get(sort_by, 0), reverse=reverse)
    except TypeError:
        pass

    total = len(customers)
    total_pages = max(1, math.ceil(total / per_page))
    start = (page - 1) * per_page
    end = start + per_page
    page_data = customers[start:end]

    return CustomerListResponse(
        customers=[CustomerSummary(**c) for c in page_data],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.get("/{customer_id}", response_model=CustomerDetail)
async def get_customer(customer_id: str):
    customer = get_customer_by_id(customer_id.upper())
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
    return CustomerDetail(**customer)
