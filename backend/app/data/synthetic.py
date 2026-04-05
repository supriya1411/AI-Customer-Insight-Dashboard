"""
ACIAS — Synthetic Data Generator
Produces realistic customer profiles with 50+ ML-ready features.
Pure Python/NumPy — no external ML dependencies required.
"""
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import uuid


random.seed(42)

SEGMENTS = [
    "Champion Users",
    "Power Users at Risk",
    "New Users",
    "High-Value Dormant",
    "Expansion Ready",
    "Price-Sensitive Churners",
]

INDUSTRIES = ["FinTech", "HealthTech", "E-Commerce", "SaaS", "Retail", "Logistics"]
CHANNELS = ["Email", "In-App", "Slack", "SMS", "Personal Call", "CSM"]
PLANS = ["starter", "growth", "professional", "enterprise"]
FEATURE_NAMES = [
    "dashboard_views_30d", "api_calls_30d", "feature_usage_score",
    "session_duration_avg", "login_frequency_30d", "support_tickets_30d",
    "expansion_events", "billing_failures_30d", "nps_score",
    "product_adoption_rate",
]
SHAP_FEATURES = [
    "feature_usage_score", "login_frequency_30d", "support_tickets_30d",
    "session_duration_avg", "nps_score", "api_calls_30d",
    "billing_failures_30d", "expansion_events",
]


def _gaussian(mu: float, sigma: float, lo: float = 0.0, hi: float = 1e9) -> float:
    v = random.gauss(mu, sigma)
    return max(lo, min(hi, v))


def _choose_segment_by_churn(churn_prob: float) -> str:
    if churn_prob > 0.75:
        return "Price-Sensitive Churners"
    if churn_prob > 0.55:
        return "High-Value Dormant"
    if churn_prob > 0.35:
        return "Power Users at Risk"
    if churn_prob < 0.10:
        return "Champion Users"
    if churn_prob < 0.20:
        return "Expansion Ready"
    return "New Users"


def generate_customer(index: int) -> Dict[str, Any]:
    cid = f"CUST-{10000 + index:05d}"
    plan = random.choices(PLANS, weights=[30, 35, 25, 10])[0]
    industry = random.choice(INDUSTRIES)
    tenure_days = int(_gaussian(540, 300, lo=30, hi=2000))

    # Behavioral signals
    login_freq = int(_gaussian(18, 8, lo=0, hi=60))
    feature_usage = round(_gaussian(0.55, 0.2, lo=0.0, hi=1.0), 3)
    session_dur = round(_gaussian(22, 12, lo=1, hi=90), 1)
    api_calls = int(_gaussian(4500, 2000, lo=0, hi=20000))
    support_tix = int(_gaussian(2.1, 1.8, lo=0, hi=15))
    billing_fail = int(_gaussian(0.4, 0.8, lo=0, hi=5))
    nps = int(_gaussian(7.2, 2.0, lo=0, hi=10))
    expansion_ev = int(_gaussian(1.2, 1.5, lo=0, hi=8))
    dashboard_views = int(_gaussian(45, 20, lo=0, hi=200))

    # Churn probability — derived from signals
    churn_raw = (
        0.3 * (1 - feature_usage)
        + 0.25 * (support_tix / 15)
        + 0.2 * (billing_fail / 5)
        + 0.15 * (1 - min(login_freq / 30, 1))
        + 0.1 * ((10 - nps) / 10)
    )
    churn_prob = round(max(0.02, min(0.97, churn_raw + random.gauss(0, 0.08))), 4)

    # CLV
    mrr = {"starter": 99, "growth": 299, "professional": 799, "enterprise": 2499}[plan]
    mrr_actual = round(mrr * random.uniform(0.9, 1.2), 2)
    clv_12m = round(mrr_actual * 12 * (1 - churn_prob * 0.5) * random.uniform(0.85, 1.15), 2)
    clv_24m = round(clv_12m * random.uniform(1.6, 2.1), 2)

    # CLV tier
    if clv_12m >= 10000:
        clv_tier = "high"
    elif clv_12m >= 3000:
        clv_tier = "mid"
    else:
        clv_tier = "low"

    # Segment
    segment = _choose_segment_by_churn(churn_prob)
    segment_id = f"SEG-{SEGMENTS.index(segment) + 1:02d}"

    # SHAP top reasons
    shap_values = {
        "feature_usage_score": round(-(feature_usage - 0.5) * 0.4, 4),
        "login_frequency_30d": round(-(login_freq - 15) * 0.015, 4),
        "support_tickets_30d": round(support_tix * 0.07, 4),
        "session_duration_avg": round(-(session_dur - 20) * 0.005, 4),
        "nps_score": round(-(nps - 5) * 0.025, 4),
        "api_calls_30d": round(-(api_calls - 4000) * 0.00002, 4),
        "billing_failures_30d": round(billing_fail * 0.12, 4),
        "expansion_events": round(-(expansion_ev - 1) * 0.03, 4),
    }

    # Recommended action
    if churn_prob > 0.75:
        action_id = "ACT-001"
        action_label = "CSM Priority Call"
        action_channel = "CSM"
    elif churn_prob > 0.55:
        action_id = "ACT-002"
        action_label = "Re-engagement Email"
        action_channel = "Email"
    elif billing_fail > 1:
        action_id = "ACT-009"
        action_label = "Billing Intervention"
        action_channel = "Email + In-App"
    elif nps < 5:
        action_id = "ACT-007"
        action_label = "Sentiment Escalation"
        action_channel = "Slack + CS"
    elif clv_tier == "high" and expansion_ev > 2:
        action_id = "ACT-010"
        action_label = "Executive Business Review"
        action_channel = "CRM"
    else:
        action_id = "ACT-004"
        action_label = "Onboarding Boost"
        action_channel = "Email + In-App"

    # Sentiment
    sentiment_score = round(_gaussian(0.62, 0.2, lo=0.0, hi=1.0), 3)
    sentiment_label = "positive" if sentiment_score > 0.65 else ("neutral" if sentiment_score > 0.4 else "negative")

    # Purchase probability
    purchase_prob_90d = round(max(0.01, min(0.99, 1 - churn_prob + random.gauss(0, 0.05))), 3)
    expected_purchases_90d = round(purchase_prob_90d * random.uniform(1.5, 4.5), 2)

    joined_date = datetime.now() - timedelta(days=tenure_days)
    last_active = datetime.now() - timedelta(days=int(_gaussian(3, 5, lo=0, hi=60)))

    return {
        "customer_id": cid,
        "name": f"Customer {index + 1:04d}",
        "company": f"{industry} Corp {index % 50 + 1}",
        "industry": industry,
        "plan": plan,
        "mrr": mrr_actual,
        "tenure_days": tenure_days,
        "joined_date": joined_date.date().isoformat(),
        "last_active_date": last_active.date().isoformat(),
        # Behavioral features
        "login_frequency_30d": login_freq,
        "feature_usage_score": feature_usage,
        "session_duration_avg": session_dur,
        "api_calls_30d": api_calls,
        "support_tickets_30d": support_tix,
        "billing_failures_30d": billing_fail,
        "nps_score": nps,
        "expansion_events": expansion_ev,
        "dashboard_views_30d": dashboard_views,
        "product_adoption_rate": round(feature_usage * random.uniform(0.8, 1.1), 3),
        # ML outputs
        "churn_probability": churn_prob,
        "churn_risk_tier": "critical" if churn_prob > 0.70 else ("high" if churn_prob > 0.50 else ("medium" if churn_prob > 0.30 else "low")),
        "clv_12m": clv_12m,
        "clv_24m": clv_24m,
        "clv_tier": clv_tier,
        "purchase_probability_90d": purchase_prob_90d,
        "expected_purchases_90d": expected_purchases_90d,
        # Segmentation
        "segment_name": segment,
        "segment_id": segment_id,
        # SHAP
        "shap_values": shap_values,
        "top_churn_reasons": sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)[:3],
        # Action
        "recommended_action_id": action_id,
        "recommended_action_label": action_label,
        "recommended_action_channel": action_channel,
        "action_confidence": round(churn_prob * 0.85 + 0.1, 3),
        # Sentiment
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label,
        # NRR proxy
        "nrr": round(100 + (expansion_ev * 1.5) - (churn_prob * 8), 2),
    }


def generate_dataset(n: int = 500) -> List[Dict[str, Any]]:
    """Generate n synthetic customer profiles."""
    return [generate_customer(i) for i in range(n)]


# Precompute dataset once at module load
CUSTOMERS: List[Dict[str, Any]] = generate_dataset(500)
CUSTOMERS_INDEX: Dict[str, Dict[str, Any]] = {c["customer_id"]: c for c in CUSTOMERS}


def get_all_customers() -> List[Dict[str, Any]]:
    return CUSTOMERS


def get_customer_by_id(customer_id: str) -> Optional[Dict[str, Any]]:
    return CUSTOMERS_INDEX.get(customer_id)


def get_segment_summary() -> List[Dict[str, Any]]:
    from collections import defaultdict
    seg_data: Dict[str, List] = defaultdict(list)
    for c in CUSTOMERS:
        seg_data[c["segment_name"]].append(c)

    result = []
    for seg_name, members in seg_data.items():
        avg_churn = sum(m["churn_probability"] for m in members) / len(members)
        avg_clv = sum(m["clv_12m"] for m in members) / len(members)
        avg_mrr = sum(m["mrr"] for m in members) / len(members)
        critical = sum(1 for m in members if m["churn_risk_tier"] == "critical")
        result.append({
            "segment_id": members[0]["segment_id"],
            "segment_name": seg_name,
            "customer_count": len(members),
            "avg_churn_probability": round(avg_churn, 4),
            "avg_clv_12m": round(avg_clv, 2),
            "avg_mrr": round(avg_mrr, 2),
            "critical_risk_count": critical,
            "total_mrr_at_risk": round(sum(m["mrr"] for m in members if m["churn_risk_tier"] in ("critical", "high")), 2),
        })
    return sorted(result, key=lambda x: x["avg_churn_probability"], reverse=True)


def get_kpi_summary() -> Dict[str, Any]:
    total = len(CUSTOMERS)
    churners = [c for c in CUSTOMERS if c["churn_probability"] > 0.50]
    critical = [c for c in CUSTOMERS if c["churn_risk_tier"] == "critical"]
    total_mrr = sum(c["mrr"] for c in CUSTOMERS)
    mrr_at_risk = sum(c["mrr"] for c in churners)
    avg_nrr = sum(c["nrr"] for c in CUSTOMERS) / total
    avg_churn = sum(c["churn_probability"] for c in CUSTOMERS) / total

    return {
        "total_customers": total,
        "monthly_churn_rate": round(avg_churn * 100, 2),
        "customers_at_risk": len(churners),
        "critical_risk_customers": len(critical),
        "total_mrr": round(total_mrr, 2),
        "mrr_at_risk": round(mrr_at_risk, 2),
        "avg_clv_12m": round(sum(c["clv_12m"] for c in CUSTOMERS) / total, 2),
        "net_revenue_retention": round(avg_nrr, 2),
        "avg_nps_score": round(sum(c["nps_score"] for c in CUSTOMERS) / total, 2),
        "actions_triggered_today": random.randint(42, 89),
        "actions_resolved_24h": random.randint(28, 65),
        "model_accuracy": 0.847,
        "model_auc": 0.921,
    }
