"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, ReferenceLine
} from "recharts";
import {
  TrendingDown, AlertTriangle, DollarSign, Users, Activity,
  Zap, Target, ArrowUpRight, ArrowDownRight, RefreshCw, Shield
} from "lucide-react";
import { fetchKPIs, fetchChurnTrend, fetchMRRTrend, fetchNRRTrend,
         fetchActionPerformance, fetchSegments, fetchInsights, type KPISummary, type MLInsight } from "@/lib/api";

const SEGMENT_COLORS: Record<string, string> = {
  "Champion Users": "#10B981", // Emerald
  "Power Users at Risk": "#F59E0B", // Amber
  "New Users": "#3B82F6", // Blue
  "High-Value Dormant": "#F43F5E", // Rose
  "Expansion Ready": "#8B5CF6", // Violet
  "Price-Sensitive Churners": "#F97316", // Orange
};

function StatCard({
  label, value, sub, icon: Icon, color, trend, trendUp
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType; color: string;
  trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="stat-card fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon size={20} color={color} />
        </div>
        {trend && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 600,
            color: trendUp ? "#10B981" : "#F43F5E"
          }}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#F1F5F9", marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#475569" }}>{sub}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(10,18,40,0.97)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "10px 14px", fontSize: 12
      }}>
        <div style={{ color: "#94A3B8", marginBottom: 6 }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color || "#F1F5F9", fontWeight: 600 }}>
            {p.name}: {typeof p.value === "number" && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [churnTrend, setChurnTrend] = useState<any[]>([]);
  const [mrrTrend, setMrrTrend] = useState<any[]>([]);
  const [nrrTrend, setNrrTrend] = useState<any[]>([]);
  const [actionPerf, setActionPerf] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [mlInsights, setMlInsights] = useState<MLInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, ct, mt, nt, ap, segs, insights] = await Promise.all([
        fetchKPIs(), fetchChurnTrend(), fetchMRRTrend(), fetchNRRTrend(),
        fetchActionPerformance(), fetchSegments(), fetchInsights()
      ]);
      setKpis(k); setChurnTrend(ct); setMrrTrend(mt); setNrrTrend(nt);
      setActionPerf(ap); setSegments(segs.segments || []); setMlInsights(insights || []);
    } catch (e: any) {
      setError("Backend offline — please start the API server on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 130, borderRadius: 16 }} />
      ))}
    </div>
  );

  if (error) return (
    <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
      <AlertTriangle size={36} color="#F59E0B" style={{ margin: "0 auto 16px" }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: "#F1F5F9", marginBottom: 8 }}>Dashboard Offline</div>
      <div style={{ fontSize: 14, marginBottom: 20 }}>{error}</div>
      <button className="btn-primary" onClick={loadData} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <RefreshCw size={14} /> Retry Connection
      </button>
    </div>
  );

  if (!kpis) return (
    <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
      <Activity size={36} color="#3B82F6" style={{ margin: "0 auto 16px" }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: "#F1F5F9", marginBottom: 8 }}>No Data Available</div>
      <div style={{ fontSize: 14, marginBottom: 20 }}>The backend is connected but hasn't returned any KPI data.</div>
      <button className="btn-primary" onClick={loadData}>
        <RefreshCw size={14} /> Fetch Data
      </button>
    </div>
  );

  const k = kpis;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }} className="fade-in">
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Platform Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "#64748B" }}>
          Real-time customer intelligence · {k.total_customers?.toLocaleString() || 0} active customers
        </p>
      </div>

      {/* KPI Cards — Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
        <StatCard
          label="Monthly Churn Rate" value={`${k.monthly_churn_rate.toFixed(2)}%`}
          sub="Target: <3.0%" icon={TrendingDown} color="#F43F5E"
          trend="-0.3% vs last month" trendUp={true}
        />
        <StatCard
          label="At-Risk Customers" value={k.customers_at_risk.toLocaleString()}
          sub={`${k.critical_risk_customers} critical · intervention required`} icon={AlertTriangle} color="#F97316"
          trend="+12 this week" trendUp={false}
        />
        <StatCard
          label="MRR at Risk" value={`$${(k.mrr_at_risk / 1000).toFixed(0)}K`}
          sub="Preventable through ARE actions" icon={DollarSign} color="#F59E0B"
          trend="12.4% of total MRR" trendUp={false}
        />
        <StatCard
          label="Net Revenue Retention" value={`${k.net_revenue_retention.toFixed(1)}%`}
          sub="Target: >104% · tracking" icon={Target} color="#10B981"
          trend="+1.8% vs Q1" trendUp={true}
        />
      </div>

      {/* KPI Cards — Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
        <StatCard
          label="Total Customers" value={k.total_customers.toLocaleString()}
          sub={`$${(k.total_mrr / 1000).toFixed(0)}K total MRR`} icon={Users} color="#3B82F6"
        />
        <StatCard
          label="Avg CLV (12m)" value={`$${k.avg_clv_12m.toLocaleString()}`}
          sub="BG/NBD + Gamma-Gamma model" icon={DollarSign} color="#8B5CF6"
          trend="+$340 vs last quarter" trendUp={true}
        />
        <StatCard
          label="Actions Today" value={k.actions_triggered_today.toString()}
          sub={`${k.actions_resolved_24h} resolved in 24h`} icon={Zap} color="#06B6D4"
        />
        <StatCard
          label="Model AUC" value={k.model_auc.toFixed(3)}
          sub={`Accuracy: ${(k.model_accuracy * 100).toFixed(1)}% · NPS: ${k.avg_nps_score.toFixed(1)}`}
          icon={Shield} color="#6366F1"
          trend="Healthy" trendUp={true}
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Churn Trend */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Churn Rate Trend (12 Weeks)</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Weekly churn probability · target: &lt;3.0%</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={churnTrend}>
              <defs>
                <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="churn_rate" name="Churn Rate %" stroke="#F43F5E" fill="url(#churnGrad)" strokeWidth={2} dot={false} />
              <ReferenceLine y={3.0} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Target 3%', fill: '#F59E0B', fontSize: 10 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Pie */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Segment Distribution</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>K-Means clustering · 6 segments</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={segments}
                dataKey="customer_count"
                nameKey="segment_name"
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
              >
                {segments.map((s: any, i: number) => (
                  <Cell key={i} fill={SEGMENT_COLORS[s.segment_name] || "#3B82F6"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 }}>
            {segments.map((s: any, i: number) => (
              <div key={s.segment_id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94A3B8" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: SEGMENT_COLORS[s.segment_name] || "#3B82F6" }} />
                {s.segment_name.split(" ").slice(0, 2).join(" ")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* MRR Trend */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>MRR Trend (12 Months)</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Total MRR vs. MRR at risk</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mrrTrend.slice(-8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mrr" name="Total MRR" fill="#3B82F6" radius={[3,3,0,0]} fillOpacity={0.8} />
              <Bar dataKey="mrr_at_risk" name="MRR at Risk" fill="#F43F5E" radius={[3,3,0,0]} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* NRR Trend */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>NRR Trend (12 Months)</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Net Revenue Retention · target: &gt;104%</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={nrrTrend}>
              <defs>
                <linearGradient id="nrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[95, 106]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="nrr" name="NRR %" stroke="#10B981" fill="url(#nrrGrad)" strokeWidth={2} dot={false} />
              <ReferenceLine y={104} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Target 104%', fill: '#F59E0B', fontSize: 10 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Performance Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>ARE Action Performance (Last 30 Days)</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Action Recommendation Engine completion rates and revenue impact</div>
        </div>
        <table className="acias-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Triggered</th>
              <th>Completed</th>
              <th>Success Rate</th>
              <th>Avg Revenue Saved</th>
            </tr>
          </thead>
          <tbody>
            {actionPerf.map((a: any, i: number) => (
              <tr key={i}>
                <td style={{ fontWeight: 600, color: "#E2E8F0" }}>{a.action}</td>
                <td>{a.triggered}</td>
                <td>{a.completed}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${a.success_rate}%`,
                          background: a.success_rate > 80 ? "#10B981" : a.success_rate > 65 ? "#F59E0B" : "#F43F5E",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9" }}>{a.success_rate}%</span>
                  </div>
                </td>
                <td style={{ color: "#10B981", fontWeight: 600 }}>${a.avg_revenue_saved.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ML Insights Predictions Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Real-Time Churn Predictions</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>ML-driven churn probabilities, KMeans segments, and recommended actions fetched live from scikit-learn pipeline</div>
        </div>
        <div style={{ maxHeight: 310, overflowY: "auto" }}>
          <table className="acias-table">
            <thead>
              <tr>
                <th style={{ position: "sticky", top: 0, background: "rgba(10,18,40,0.95)", zIndex: 1 }}>Customer ID</th>
                <th style={{ position: "sticky", top: 0, background: "rgba(10,18,40,0.95)", zIndex: 1 }}>Churn Risk</th>
                <th style={{ position: "sticky", top: 0, background: "rgba(10,18,40,0.95)", zIndex: 1 }}>Segment</th>
                <th style={{ position: "sticky", top: 0, background: "rgba(10,18,40,0.95)", zIndex: 1 }}>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {mlInsights.map((insight: MLInsight, i: number) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "#E2E8F0" }}>{insight.customer_id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(insight.churn_probability * 100, 100)}%`,
                            background: insight.churn_probability >= 0.7 ? "#F43F5E" : insight.churn_probability >= 0.4 ? "#F59E0B" : "#10B981",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9" }}>
                        {(insight.churn_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>{insight.segment}</td>
                  <td style={{ color: insight.recommended_action.includes("Call") ? "#F43F5E" : "#3B82F6", fontWeight: 500 }}>
                    {insight.recommended_action}
                  </td>
                </tr>
              ))}
              {mlInsights.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "30px 0", color: "#64748B" }}>No predictions loaded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
