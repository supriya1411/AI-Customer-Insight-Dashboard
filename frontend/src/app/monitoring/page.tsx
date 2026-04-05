"use client";
import { useEffect, useState } from "react";
import { fetchMonitoring, fetchChampionChallenger } from "@/lib/api";
import { Activity, Shield, Clock, TrendingUp, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,18,40,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: "#94A3B8", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || "#F1F5F9", fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function MonitoringPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [cc, setCC] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMonitoring(), fetchChampionChallenger()])
      .then(([d, c]) => { setDashboard(d); setCC(c); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
    </div>
  );

  const models = dashboard?.models || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="fade-in">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Model Monitor</h1>
        <p style={{ fontSize: 14, color: "#64748B" }}>
          Real-time ML health · PSI drift detection · Champion-Challenger status
        </p>
      </div>

      {/* Platform Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Predictions Today", value: dashboard?.total_predictions_today?.toLocaleString(), color: "#3B82F6", icon: Activity },
          { label: "Avg Latency", value: `${dashboard?.avg_latency_ms}ms`, color: "#10B981", icon: Zap },
          { label: "Error Rate", value: `${(dashboard?.error_rate * 100).toFixed(2)}%`, color: "#F59E0B", icon: AlertTriangle },
          { label: "Models Deployed", value: models.length, color: "#8B5CF6", icon: Shield },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Champion-Challenger */}
      {cc && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Champion-Challenger Deployment</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Zero-downtime blue-green rollout · Kubernetes</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#10B981", fontWeight: 600 }}>
              <div className="pulse-dot" />
              Active · {cc.challenger?.days_remaining} days remaining
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Champion */}
            <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12 }}>🏆 CHAMPION (PRODUCTION)</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>{cc.champion?.model_id}</div>
              {[
                { label: "AUC-ROC", value: cc.champion?.auc_roc },
                { label: "F1 Score", value: cc.champion?.f1_score },
                { label: "Action Success Rate", value: `${(cc.champion?.action_success_rate * 100).toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>{typeof value === "number" ? value.toFixed(3) : value}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#334155", marginTop: 8 }}>Deployed: {cc.champion?.deployed_date}</div>
            </div>
            {/* Challenger */}
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12 }}>🎯 CHALLENGER (SHADOW MODE)</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>{cc.challenger?.model_id}</div>
              {[
                { label: "AUC-ROC", value: cc.challenger?.auc_roc, better: cc.challenger?.auc_roc > cc.champion?.auc_roc },
                { label: "F1 Score", value: cc.challenger?.f1_score, better: cc.challenger?.f1_score > cc.champion?.f1_score },
                { label: "Action Success Rate", value: `${(cc.challenger?.action_success_rate * 100).toFixed(1)}%`, better: cc.challenger?.action_success_rate > cc.champion?.action_success_rate },
              ].map(({ label, value, better }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: better ? "#10B981" : "#F43F5E", display: "flex", alignItems: "center", gap: 4 }}>
                    {better ? "↑ " : ""}{typeof value === "number" ? value.toFixed(3) : value}
                  </span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#10B981", marginTop: 8, fontWeight: 600 }}>
                ✓ On track for auto-promotion · {cc.projected_promotion_date}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {models.map((m: any) => (
          <div key={m.model_name} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#F1F5F9", marginBottom: 4 }}>{m.model_name}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>Last retrain: {m.last_retrain} · Next: {m.next_retrain}</div>
              </div>
              <div className={m.status === "healthy" ? "badge-healthy" : "badge-degraded"}>{m.status}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {m.auc_roc > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>AUC-ROC</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#3B82F6" }}>{m.auc_roc.toFixed(3)}</div>
                </div>
              )}
              {m.f1_score > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>F1 Score</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#10B981" }}>{m.f1_score.toFixed(3)}</div>
                </div>
              )}
              {m.mae && (
                <div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>MAE</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>${m.mae}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>PSI</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.psi > 0.20 ? "#F43F5E" : "#10B981" }}>{m.psi.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>Predictions/Day</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#94A3B8" }}>{m.predictions_today.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>Drift</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.drift_detected ? "#F43F5E" : "#10B981" }}>
                  {m.drift_detected ? "⚠ Detected" : "✓ None"}
                </div>
              </div>
            </div>
            {/* PSI Bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginBottom: 4 }}>
                <span>PSI (Population Stability Index)</span>
                <span>Alert @ 0.25</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${Math.min(m.psi / 0.25 * 100, 100)}%`,
                  background: m.psi > 0.20 ? "#F43F5E" : m.psi > 0.15 ? "#F59E0B" : "#10B981"
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
