"""
ACIAS — Pydantic v2 Schemas
All request/response models for the API layer.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Tuple
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────────────────────

class ChurnRiskTier(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class CLVTier(str, Enum):
    high = "high"
    mid = "mid"
    low = "low"


class SentimentLabel(str, Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"


class ActionChannel(str, Enum):
    csm = "CSM"
    email = "Email"
    in_app = "In-App"
    slack = "Slack"
    sms = "SMS"
    personal_call = "Personal Call"
    crm = "CRM"
    email_in_app = "Email + In-App"
    slack_cs = "Slack + CS"


# ── Customer Schemas ──────────────────────────────────────────────────────────

class CustomerSummary(BaseModel):
    customer_id: str
    name: str
    company: str
    industry: str
    plan: str
    mrr: float
    tenure_days: int
    churn_probability: float
    churn_risk_tier: ChurnRiskTier
    clv_12m: float
    clv_tier: CLVTier
    segment_name: str
    segment_id: str
    recommended_action_id: str
    recommended_action_label: str
    sentiment_label: SentimentLabel
    nrr: float


class CustomerDetail(CustomerSummary):
    joined_date: str
    last_active_date: str
    login_frequency_30d: int
    feature_usage_score: float
    session_duration_avg: float
    api_calls_30d: int
    support_tickets_30d: int
    billing_failures_30d: int
    nps_score: int
    expansion_events: int
    dashboard_views_30d: int
    product_adoption_rate: float
    clv_24m: float
    purchase_probability_90d: float
    expected_purchases_90d: float
    shap_values: Dict[str, float]
    top_churn_reasons: List[Tuple[str, float]]
    recommended_action_channel: str
    action_confidence: float
    sentiment_score: float


class CustomerListResponse(BaseModel):
    customers: List[CustomerSummary]
    total: int
    page: int
    per_page: int
    total_pages: int


# ── Segment Schemas ───────────────────────────────────────────────────────────

class SegmentSummary(BaseModel):
    segment_id: str
    segment_name: str
    customer_count: int
    avg_churn_probability: float
    avg_clv_12m: float
    avg_mrr: float
    critical_risk_count: int
    total_mrr_at_risk: float


class SegmentListResponse(BaseModel):
    segments: List[SegmentSummary]
    total: int


# ── KPI Schemas ───────────────────────────────────────────────────────────────

class KPISummary(BaseModel):
    total_customers: int
    monthly_churn_rate: float
    customers_at_risk: int
    critical_risk_customers: int
    total_mrr: float
    mrr_at_risk: float
    avg_clv_12m: float
    net_revenue_retention: float
    avg_nps_score: float
    actions_triggered_today: int
    actions_resolved_24h: int
    model_accuracy: float
    model_auc: float


# ── Action Schemas ────────────────────────────────────────────────────────────

class ActionStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    dismissed = "dismissed"


class ActionItem(BaseModel):
    action_id: str
    action_label: str
    customer_id: str
    customer_name: str
    segment_name: str
    churn_probability: float
    clv_12m: float
    channel: str
    owner: str
    priority: int  # 1 = highest
    trigger_condition: str
    success_signal: str
    predicted_revenue_impact: float
    status: ActionStatus = ActionStatus.pending
    created_at: str


class ActionOutcomeRequest(BaseModel):
    action_id: str
    customer_id: str
    outcome: str  # "success" | "failed" | "no_response"
    notes: Optional[str] = None


class ActionListResponse(BaseModel):
    actions: List[ActionItem]
    total: int
    pending: int
    in_progress: int
    completed: int


# ── Inference Schemas ─────────────────────────────────────────────────────────

class InferenceRequest(BaseModel):
    customer_id: str


class ChurnInferenceResponse(BaseModel):
    customer_id: str
    churn_probability: float
    risk_tier: ChurnRiskTier
    confidence: float
    top_reasons: List[Dict[str, Any]]
    recommended_action: str
    time_to_intervention: str
    model_version: str = "xgb-v2.1-prod"


class CLVInferenceResponse(BaseModel):
    customer_id: str
    clv_12m: float
    clv_24m: float
    clv_tier: CLVTier
    purchase_probability_90d: float
    expected_purchases_90d: float
    model_version: str = "bg_nbd-v1.3-prod"


# ── Chatbot Schemas ───────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[ChatMessage]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    data: Optional[Dict[str, Any]] = None
    follow_up_suggestions: List[str] = []


# ── Monitoring Schemas ────────────────────────────────────────────────────────

class ModelMetric(BaseModel):
    model_name: str
    auc_roc: float
    precision: float
    recall: float
    f1_score: float
    mae: Optional[float] = None
    psi: float
    status: str  # "healthy" | "degraded" | "alert"
    last_retrain: str
    next_retrain: str
    predictions_today: int
    drift_detected: bool


class MonitoringDashboard(BaseModel):
    models: List[ModelMetric]
    total_predictions_today: int
    avg_latency_ms: float
    error_rate: float
    champion_challenger_active: bool
    last_updated: str
