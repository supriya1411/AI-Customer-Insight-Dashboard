"use client";
import { useEffect, useState } from "react";
import { fetchCustomers, type CustomerSummary } from "@/lib/api";
import { Search, Filter, ArrowUpDown, RefreshCw } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  critical: "#F43F5E", high: "#F97316", medium: "#F59E0B", low: "#10B981"
};
const CLV_COLORS: Record<string, string> = {
  high: "#10B981", mid: "#3B82F6", low: "#64748B"
};
const PLAN_COLORS: Record<string, string> = {
  enterprise: "#8B5CF6", professional: "#3B82F6", growth: "#06B6D4", starter: "#475569"
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [sortBy, setSortBy] = useState("churn_probability");

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 20, sort_by: sortBy, sort_dir: "desc" };
      if (search) params.search = search;
      if (riskFilter) params.risk_tier = riskFilter;
      if (planFilter) params.plan = planFilter;
      const res = await fetchCustomers(params);
      setCustomers(res.customers || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search, riskFilter, planFilter, sortBy]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="fade-in">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Customer 360°
        </h1>
        <p style={{ fontSize: 14, color: "#64748B" }}>
          {total.toLocaleString()} customers · real-time churn scores · CLV tiers · ARE actions
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={13} color="#475569" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
          <input
            className="acias-input"
            placeholder="Search by ID, name, or company…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 32, height: 38 }}
          />
        </div>
        <select className="acias-select" value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1); }}>
          <option value="">All Risk Tiers</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="acias-select" value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}>
          <option value="">All Plans</option>
          <option value="enterprise">Enterprise</option>
          <option value="professional">Professional</option>
          <option value="growth">Growth</option>
          <option value="starter">Starter</option>
        </select>
        <select className="acias-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="churn_probability">Sort: Churn Risk</option>
          <option value="clv_12m">Sort: CLV (12M)</option>
          <option value="mrr">Sort: MRR</option>
          <option value="tenure_days">Sort: Tenure</option>
          <option value="nrr">Sort: NRR</option>
        </select>
        <span style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>
          {total.toLocaleString()} results
        </span>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
            <RefreshCw size={22} style={{ margin: "0 auto 12px", display: "block", animation: "spin 1s linear infinite" }} />
            Loading customers…
          </div>
        ) : (
          <table className="acias-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Churn Risk</th>
                <th>Churn Prob</th>
                <th>CLV (12M)</th>
                <th>MRR</th>
                <th>Segment</th>
                <th>Recommended Action</th>
                <th>Sentiment</th>
                <th>NRR</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.customer_id} style={{ cursor: "pointer" }}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#E2E8F0" }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{c.customer_id} · {c.company}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, textTransform: "capitalize",
                      background: `${PLAN_COLORS[c.plan] || "#475569"}18`,
                      color: PLAN_COLORS[c.plan] || "#475569",
                      border: `1px solid ${PLAN_COLORS[c.plan] || "#475569"}30`,
                    }}>
                      {c.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-${c.churn_risk_tier}`}>{c.churn_risk_tier}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{
                          width: `${c.churn_probability * 100}%`,
                          background: RISK_COLORS[c.churn_risk_tier],
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: RISK_COLORS[c.churn_risk_tier] }}>
                        {(c.churn_probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: CLV_COLORS[c.clv_tier] }}>${c.clv_12m.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{c.clv_tier} tier</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>${c.mrr.toFixed(0)}</td>
                  <td style={{ fontSize: 12, color: "#94A3B8" }}>{c.segment_name}</td>
                  <td>
                    <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 600 }}>{c.recommended_action_id}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{c.recommended_action_label}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: c.sentiment_label === "positive" ? "#10B981" : c.sentiment_label === "negative" ? "#F43F5E" : "#F59E0B"
                    }}>
                      {c.sentiment_label.charAt(0).toUpperCase() + c.sentiment_label.slice(1)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: c.nrr >= 100 ? "#10B981" : "#F43F5E" }}>{c.nrr.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
          <span style={{ fontSize: 12, color: "#64748B" }}>Page {page} of {Math.ceil(total / 20)}</span>
          <button className="btn-ghost" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </div>
  );
}
