"use client";
import { useEffect, useState } from "react";
import { fetchActions, fetchActionStats, type ActionItem } from "@/lib/api";
import { Zap, CheckCircle, Clock, XCircle, DollarSign, Filter, RefreshCw } from "lucide-react";

const RISK_BADGE: Record<string, string> = {
  critical: "badge-critical", high: "badge-high", medium: "badge-medium", low: "badge-low"
};
const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", in_progress: "#3B82F6", completed: "#10B981", dismissed: "#475569"
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", in_progress: "In Progress", completed: "Completed", dismissed: "Dismissed"
};

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadActions = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 20 };
      if (filterStatus) params.status = filterStatus;
      if (filterOwner) params.owner = filterOwner;
      const [actionsRes, statsRes] = await Promise.all([
        fetchActions(params), fetchActionStats()
      ]);
      setActions(actionsRes.actions || []);
      setTotal(actionsRes.total || 0);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadActions(); }, [page, filterStatus, filterOwner]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Action Center
        </h1>
        <p style={{ fontSize: 14, color: "#64748B" }}>
          Action Recommendation Engine (ARE) · {total.toLocaleString()} actions across all customers
        </p>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          {[
            { label: "Total Actions", value: stats.total_actions, color: "#3B82F6", icon: Zap },
            { label: "Pending", value: stats.pending, color: "#F59E0B", icon: Clock },
            { label: "In Progress", value: stats.in_progress, color: "#06B6D4", icon: RefreshCw },
            { label: "Completed", value: stats.completed, color: "#10B981", icon: CheckCircle },
            { label: "Predicted Impact", value: `$${(stats.total_predicted_impact / 1000).toFixed(0)}K`, color: "#8B5CF6", icon: DollarSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="stat-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Icon size={16} color={color} />
                <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>{label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="glass-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Filter size={14} color="#64748B" />
        <select className="acias-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select className="acias-select" value={filterOwner} onChange={e => { setFilterOwner(e.target.value); setPage(1); }}>
          <option value="">All Owners</option>
          <option value="CSM">CSM</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Support">Support</option>
          <option value="CS">CS</option>
        </select>
        <button className="btn-ghost" onClick={loadActions} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#64748B" }}>
          Showing {actions.length} of {total}
        </div>
      </div>

      {/* Actions Table */}
      <div className="glass-card" style={{ overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
            <RefreshCw size={24} style={{ margin: "0 auto 12px", display: "block", animation: "spin 1s linear infinite" }} />
            Loading actions…
          </div>
        ) : (
          <table className="acias-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Action</th>
                <th>Customer</th>
                <th>Segment</th>
                <th>Churn Risk</th>
                <th>CLV (12M)</th>
                <th>Channel</th>
                <th>Owner</th>
                <th>Impact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a, i) => (
                <tr key={`${a.action_id}_${a.customer_id}_${i}`}>
                  <td>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6,
                      background: a.priority === 1 ? "rgba(244,63,94,0.15)" : a.priority === 2 ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
                      color: a.priority === 1 ? "#F43F5E" : a.priority === 2 ? "#F59E0B" : "#3B82F6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800,
                    }}>
                      {a.priority}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#E2E8F0", fontSize: 13 }}>{a.action_label}</div>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{a.action_id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{a.customer_name}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{a.customer_id}</div>
                  </td>
                  <td><span style={{ fontSize: 12, color: "#94A3B8" }}>{a.segment_name}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ width: 50 }}>
                        <div className="progress-fill" style={{
                          width: `${a.churn_probability * 100}%`,
                          background: a.churn_probability > 0.7 ? "#F43F5E" : a.churn_probability > 0.5 ? "#F97316" : "#F59E0B"
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{(a.churn_probability * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: "#3B82F6" }}>${a.clv_12m.toLocaleString()}</td>
                  <td><span style={{ fontSize: 12, color: "#94A3B8" }}>{a.channel}</span></td>
                  <td><span style={{ fontSize: 12, color: "#CBD5E1" }}>{a.owner}</span></td>
                  <td style={{ color: "#10B981", fontWeight: 600 }}>${a.predicted_revenue_impact.toLocaleString()}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 5,
                      background: `${STATUS_COLORS[a.status]}18`,
                      color: STATUS_COLORS[a.status],
                      border: `1px solid ${STATUS_COLORS[a.status]}30`,
                    }}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            ← Previous
          </button>
          <span style={{ fontSize: 12, color: "#64748B" }}>Page {page} · {Math.ceil(total / 20)} pages</span>
          <button className="btn-ghost" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
