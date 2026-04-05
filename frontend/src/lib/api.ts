/**
 * ACIAS API Client
 * Centralized axios instance + typed fetchers for all backend endpoints.
 */
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Types ──────────────────────────────────────────────────────────────
export interface KPISummary {
  total_customers: number;
  monthly_churn_rate: number;
  customers_at_risk: number;
  critical_risk_customers: number;
  total_mrr: number;
  mrr_at_risk: number;
  avg_clv_12m: number;
  net_revenue_retention: number;
  avg_nps_score: number;
  actions_triggered_today: number;
  actions_resolved_24h: number;
  model_accuracy: number;
  model_auc: number;
}

export interface CustomerSummary {
  customer_id: string;
  name: string;
  company: string;
  industry: string;
  plan: string;
  mrr: number;
  tenure_days: number;
  churn_probability: number;
  churn_risk_tier: 'critical' | 'high' | 'medium' | 'low';
  clv_12m: number;
  clv_tier: 'high' | 'mid' | 'low';
  segment_name: string;
  segment_id: string;
  recommended_action_id: string;
  recommended_action_label: string;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  nrr: number;
}

export interface CustomerDetail extends CustomerSummary {
  joined_date: string;
  last_active_date: string;
  login_frequency_30d: number;
  feature_usage_score: number;
  session_duration_avg: number;
  api_calls_30d: number;
  support_tickets_30d: number;
  billing_failures_30d: number;
  nps_score: number;
  expansion_events: number;
  dashboard_views_30d: number;
  product_adoption_rate: number;
  clv_24m: number;
  purchase_probability_90d: number;
  expected_purchases_90d: number;
  shap_values: Record<string, number>;
  top_churn_reasons: [string, number][];
  recommended_action_channel: string;
  action_confidence: number;
  sentiment_score: number;
}

export interface SegmentSummary {
  segment_id: string;
  segment_name: string;
  customer_count: number;
  avg_churn_probability: number;
  avg_clv_12m: number;
  avg_mrr: number;
  critical_risk_count: number;
  total_mrr_at_risk: number;
}

export interface ActionItem {
  action_id: string;
  action_label: string;
  customer_id: string;
  customer_name: string;
  segment_name: string;
  churn_probability: number;
  clv_12m: number;
  channel: string;
  owner: string;
  priority: number;
  trigger_condition: string;
  success_signal: string;
  predicted_revenue_impact: number;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  created_at: string;
}

export interface ModelMetric {
  model_name: string;
  auc_roc: number;
  precision: number;
  recall: number;
  f1_score: number;
  mae?: number;
  psi: number;
  status: 'healthy' | 'degraded' | 'alert';
  last_retrain: string;
  next_retrain: string;
  predictions_today: number;
  drift_detected: boolean;
}

export interface ChatResponse {
  response: string;
  intent: string;
  confidence: number;
  data?: Record<string, unknown>;
  follow_up_suggestions: string[];
}

// ── Fetchers ───────────────────────────────────────────────────────────
export const fetcher = (url: string) => api.get(url).then(r => r.data);

export const fetchKPIs = () => api.get<KPISummary>('/dashboard/kpis').then(r => r.data);
export const fetchCustomers = (params?: Record<string, string | number>) =>
  api.get('/customers', { params }).then(r => r.data);
export const fetchCustomer = (id: string) => api.get<CustomerDetail>(`/customers/${id}`).then(r => r.data);
export const fetchSegments = () => api.get<{ segments: SegmentSummary[]; total: number }>('/segments').then(r => r.data);
export const fetchActions = (params?: Record<string, string | number>) =>
  api.get('/actions', { params }).then(r => r.data);
export const fetchActionStats = () => api.get('/actions/stats/summary').then(r => r.data);
export const fetchMonitoring = () => api.get('/monitoring/dashboard').then(r => r.data);
export const fetchChampionChallenger = () => api.get('/monitoring/champion-challenger').then(r => r.data);
export const fetchChurnTrend = () => api.get('/dashboard/churn-trend').then(r => r.data);
export const fetchMRRTrend = () => api.get('/dashboard/mrr-trend').then(r => r.data);
export const fetchNRRTrend = () => api.get('/dashboard/nrr-trend').then(r => r.data);
export const fetchActionPerformance = () => api.get('/dashboard/action-performance').then(r => r.data);
export const fetchChurnDistribution = () => api.get('/segments/analytics/churn-distribution').then(r => r.data);
export const fetchCLVBySegment = () => api.get('/segments/analytics/clv-by-segment').then(r => r.data);

export interface MLInsight {
  customer_id: string;
  churn_probability: number;
  segment: string;
  recommended_action: string;
}

export const fetchInsights = () => api.get<MLInsight[]>('/customers/insights').then(r => r.data);

export const sendChat = (message: string, history: { role: string; content: string }[] = []) =>
  api.post<ChatResponse>('/chatbot/chat', { message, history }).then(r => r.data);

export const predictChurn = (customer_id: string) =>
  api.post('/inference/churn', { customer_id }).then(r => r.data);
