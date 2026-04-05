"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ScatterChart, Scatter,
  ZAxis, AreaChart, Area, Cell
} from "recharts";
import { fetchSegments, fetchChurnDistribution, fetchCLVBySegment, type SegmentSummary } from "@/lib/api";
import { TrendingDown, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

const SEGMENT_COLORS: Record<string, string> = {
  "Champion Users": "#10B981",
  "Power Users at Risk": "#F59E0B",
  "New Users": "#3B82F6",
  "High-Value Dormant": "#F43F5E",
  "Expansion Ready": "#8B5CF6",
  "Price-Sensitive Churners": "#F97316",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,18,40,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: "#94A3B8", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.fill || "#F1F5F9", fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" && p.value > 10 ? `$${p.value.toLocaleString()}` : typeof p.value === "number" ? `${(p.value * (p.name.includes("%") ? 100 : 1)).toFixed(1)}${p.name.includes("CLV") ? "" : ""}` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [segments, setSegments] = useState<SegmentSummary[]>([]);
  const [churnDist, setChurnDist] = useState<any[]>([]);
  const [clvSeg, setClvSeg] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSegments(), fetchChurnDistribution(), fetchCLVBySegment()])
      .then(([s, cd, cs]) => {
        setSegments(s.segments);
        setChurnDist(cd);
        setClvSeg(cs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }} className="fade-in">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Analytics</h1>
        <p style={{ fontSize: 14, color: "#64748B" }}>Segment intelligence · churn distribution · CLV analysis</p>
      </div>

      {/* Segment Health Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {segments.map(seg => {
          const color = SEGMENT_COLORS[seg.segment_name] || "#3B82F6";
          return (
            <div key={seg.segment_id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#F1F5F9", marginBottom: 2 }}>
                    {seg.segment_name}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{seg.customer_count} customers</div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color, padding: "3px 8px",
                  background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 6
                }}>
                  {(seg.avg_churn_probability * 100).toFixed(1)}% churn
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>AVG CLV (12M)</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color }}>${seg.avg_clv_12m.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>MRR AT RISK</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#F43F5E" }}>${(seg.total_mrr_at_risk / 1000).toFixed(0)}K</div>
                </div>
              </div>
              <div className="progress-bar" style={{ marginTop: 12 }}>
                <div className="progress-fill" style={{ width: `${seg.avg_churn_probability * 100}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Churn Distribution */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Churn Probability Distribution</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Customer count by churn risk bucket</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={churnDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Customers" radius={[4,4,0,0]}>
                {churnDist.map((_: any, i: number) => (
                  <Cell key={i} fill={["#10B981","#34D399","#F59E0B","#F97316","#F43F5E","#BE123C"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CLV by Segment */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>CLV by Segment</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Average 12-month CLV vs. MRR per segment</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={clvSeg} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="segment_name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_clv_12m" name="Avg CLV (12M)" fill="#3B82F6" radius={[0,4,4,0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Comparison Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Full Segment Comparison</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>All metrics per segment · sorted by churn probability</div>
        </div>
        <table className="acias-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Customers</th>
              <th>Avg Churn</th>
              <th>Avg CLV (12M)</th>
              <th>Avg MRR</th>
              <th>Critical Risk</th>
              <th>MRR at Risk</th>
            </tr>
          </thead>
          <tbody>
            {segments.map(s => {
              const color = SEGMENT_COLORS[s.segment_name] || "#3B82F6";
              return (
                <tr key={s.segment_id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>{s.segment_name}</span>
                    </div>
                  </td>
                  <td>{s.customer_count}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: s.avg_churn_probability > 0.6 ? "#F43F5E" : s.avg_churn_probability > 0.3 ? "#F59E0B" : "#10B981"
                    }}>
                      {(s.avg_churn_probability * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>${s.avg_clv_12m.toLocaleString()}</td>
                  <td>${s.avg_mrr.toFixed(0)}</td>
                  <td>
                    <span style={{ color: "#F43F5E", fontWeight: 600 }}>{s.critical_risk_count}</span>
                  </td>
                  <td style={{ color: "#F43F5E", fontWeight: 600 }}>${(s.total_mrr_at_risk / 1000).toFixed(1)}K</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
