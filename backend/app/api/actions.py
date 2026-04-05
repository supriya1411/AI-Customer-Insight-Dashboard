"""
ACIAS — Actions API Routes
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, Any
from app.data.data_loader import get_all_customers
from app.services.are_engine import generate_actions_from_customers, get_action_catalog
from app.schemas.schemas import ActionListResponse, ActionItem, ActionOutcomeRequest
import math

router = APIRouter(prefix="/actions", tags=["Actions"])

# In-memory action store (stateful for demo)
_ACTION_STORE: Dict[str, Dict] = {}


def _ensure_actions_loaded():
    global _ACTION_STORE
    if not _ACTION_STORE:
        customers = get_all_customers()
        actions = generate_actions_from_customers(customers)
        _ACTION_STORE = {f"{a['action_id']}_{a['customer_id']}": a for a in actions}
    return list(_ACTION_STORE.values())


@router.get("", response_model=ActionListResponse)
async def list_actions(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status: Optional[str] = Query(None),
    action_id: Optional[str] = Query(None),
    owner: Optional[str] = Query(None),
    priority: Optional[int] = Query(None),
    segment_name: Optional[str] = Query(None),
):
    actions = _ensure_actions_loaded()

    if status:
        actions = [a for a in actions if a["status"] == status]
    if action_id:
        actions = [a for a in actions if a["action_id"] == action_id]
    if owner:
        actions = [a for a in actions if owner.lower() in a["owner"].lower()]
    if priority:
        actions = [a for a in actions if a["priority"] == priority]
    if segment_name:
        actions = [a for a in actions if segment_name.lower() in a["segment_name"].lower()]

    total = len(actions)
    pending = sum(1 for a in actions if a["status"] == "pending")
    in_progress = sum(1 for a in actions if a["status"] == "in_progress")
    completed = sum(1 for a in actions if a["status"] == "completed")

    start = (page - 1) * per_page
    page_data = actions[start : start + per_page]

    return ActionListResponse(
        actions=[ActionItem(**a) for a in page_data],
        total=total,
        pending=pending,
        in_progress=in_progress,
        completed=completed,
    )


@router.post("/{action_key}/outcome")
async def record_outcome(action_key: str, body: ActionOutcomeRequest) -> Dict[str, Any]:
    if action_key not in _ACTION_STORE:
        # Try partial match
        matches = [k for k in _ACTION_STORE if body.customer_id in k]
        if matches:
            action_key = matches[0]
        else:
            raise HTTPException(status_code=404, detail="Action not found")

    _ACTION_STORE[action_key]["status"] = (
        "completed" if body.outcome == "success" else "dismissed"
    )
    return {"success": True, "action_key": action_key, "new_status": _ACTION_STORE[action_key]["status"]}


@router.get("/catalog")
async def list_catalog():
    return {"catalog": get_action_catalog()}


@router.get("/stats/summary")
async def action_stats() -> Dict[str, Any]:
    actions = _ensure_actions_loaded()
    total_impact = sum(a["predicted_revenue_impact"] for a in actions if a["status"] != "dismissed")
    completed_impact = sum(a["predicted_revenue_impact"] for a in actions if a["status"] == "completed")
    return {
        "total_actions": len(actions),
        "pending": sum(1 for a in actions if a["status"] == "pending"),
        "in_progress": sum(1 for a in actions if a["status"] == "in_progress"),
        "completed": sum(1 for a in actions if a["status"] == "completed"),
        "dismissed": sum(1 for a in actions if a["status"] == "dismissed"),
        "total_predicted_impact": round(total_impact, 2),
        "realized_impact": round(completed_impact, 2),
        "completion_rate": round(
            sum(1 for a in actions if a["status"] == "completed") / max(len(actions), 1) * 100, 2
        ),
    }
