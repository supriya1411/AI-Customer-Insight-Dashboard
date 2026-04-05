"""
ACIAS — Action Recommendation Engine (ARE)
Converts ML model outputs into prioritized, owner-assigned, executable business actions.
Implements the 10-action catalog from the PRD.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random


# ── ARE Action Catalog ─────────────────────────────────────────────────────────
ACTION_CATALOG = {
    "ACT-001": {
        "label": "CSM Priority Call",
        "channel": "CSM",
        "owner": "CSM",
        "trigger": "churn_probability > 0.75 AND open_tickets >= 2",
        "success_signal": "Log sent within 7 days",
        "priority": 1,
        "revenue_multiplier": 0.85,
    },
    "ACT-002": {
        "label": "Re-engagement Email",
        "channel": "Email",
        "owner": "Marketing",
        "trigger": "no_login_days > 14 AND churn_prob > 0.65",
        "success_signal": "Login sent within 7 days",
        "priority": 2,
        "revenue_multiplier": 0.60,
    },
    "ACT-003": {
        "label": "Retention Discount",
        "channel": "Email + CSM",
        "owner": "CSM/Marketing",
        "trigger": "churn_prob > 0.66 AND clv_tier in (high, mid)",
        "success_signal": "Subscription renewal; discount redeemed",
        "priority": 2,
        "revenue_multiplier": 0.72,
    },
    "ACT-004": {
        "label": "Onboarding Boost",
        "channel": "In-App + Email",
        "owner": "Marketing",
        "trigger": "tenure_days < 30 AND feature_usage_score < 0.25",
        "success_signal": "Feature adoption score > 0.30 by day 30",
        "priority": 3,
        "revenue_multiplier": 0.55,
    },
    "ACT-005": {
        "label": "Expansion Upsell",
        "channel": "In-App + Email",
        "owner": "Sales/CSM",
        "trigger": "clv_tier = high AND expansion_events > 3",
        "success_signal": "Plan upgrade within 30 days",
        "priority": 2,
        "revenue_multiplier": 1.25,
    },
    "ACT-006": {
        "label": "NPS Recovery",
        "channel": "Personal Call",
        "owner": "CS",
        "trigger": "nps_score < 5 AND clv_tier in (high, mid)",
        "success_signal": "NPS response score >= 7",
        "priority": 2,
        "revenue_multiplier": 0.65,
    },
    "ACT-007": {
        "label": "Sentiment Escalation",
        "channel": "Slack + CS",
        "owner": "CS Lead",
        "trigger": "sentiment_score < 0.40 AND clv_tier in (high, mid)",
        "success_signal": "Ticket resolved; follow-up scheduled",
        "priority": 1,
        "revenue_multiplier": 0.78,
    },
    "ACT-008": {
        "label": "Referral Invite",
        "channel": "Email + In-App",
        "owner": "Marketing",
        "trigger": "segment = Champion AND nps_score >= 9",
        "success_signal": "Referral link clicked; referral converted",
        "priority": 4,
        "revenue_multiplier": 1.35,
    },
    "ACT-009": {
        "label": "Billing Intervention",
        "channel": "Email + In-App Banner",
        "owner": "Support",
        "trigger": "billing_failures_30d >= 2",
        "success_signal": "Payment method updated; invoice cleared",
        "priority": 1,
        "revenue_multiplier": 0.95,
    },
    "ACT-010": {
        "label": "Executive Business Review",
        "channel": "Calendar via CRM",
        "owner": "Account Executive",
        "trigger": "mrr > $2000 AND clv_tier = high AND expansion_events > 0.40",
        "success_signal": "Calendar event created; expansion commitment secured",
        "priority": 2,
        "revenue_multiplier": 1.50,
    },
}


def generate_actions_from_customers(customers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate action items from customer data."""
    actions = []
    now = datetime.now()

    for customer in customers:
        action_id = customer.get("recommended_action_id", "ACT-004")
        catalog = ACTION_CATALOG.get(action_id, ACTION_CATALOG["ACT-004"])
        churn_prob = customer.get("churn_probability", 0.5)
        clv = customer.get("clv_12m", 1000)

        predicted_impact = round(clv * catalog["revenue_multiplier"] * churn_prob, 2)

        # Assign a status
        status_weights = [0.50, 0.25, 0.15, 0.10]
        status = random.choices(
            ["pending", "in_progress", "completed", "dismissed"],
            weights=status_weights
        )[0]

        created_offset = random.randint(0, 72)
        created_at = (now - timedelta(hours=created_offset)).isoformat()

        actions.append({
            "action_id": action_id,
            "action_label": catalog["label"],
            "customer_id": customer["customer_id"],
            "customer_name": customer.get("name", "Unknown"),
            "segment_name": customer.get("segment_name", "Unknown"),
            "churn_probability": churn_prob,
            "clv_12m": clv,
            "channel": catalog["channel"],
            "owner": catalog["owner"],
            "priority": catalog["priority"],
            "trigger_condition": catalog["trigger"],
            "success_signal": catalog["success_signal"],
            "predicted_revenue_impact": predicted_impact,
            "status": status,
            "created_at": created_at,
        })

    # Sort by priority then churn probability
    return sorted(actions, key=lambda x: (x["priority"], -x["churn_probability"]))


def get_action_catalog() -> List[Dict[str, Any]]:
    return [
        {"action_id": k, **v}
        for k, v in ACTION_CATALOG.items()
    ]
