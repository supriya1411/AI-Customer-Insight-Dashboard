"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, PieChart, Zap, MessageSquare,
  Activity, ChevronRight, Brain, Sparkles
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/actions", label: "Action Center", icon: Zap },
  { href: "/chatbot", label: "AI Analyst", icon: MessageSquare },
  { href: "/monitoring", label: "Model Monitor", icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "rgba(5,11,24,0.95)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "8px 10px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Brain size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", color: "#F1F5F9" }}>
              ACIAS
            </div>
            <div style={{ fontSize: 10, color: "#475569", fontWeight: 500, letterSpacing: "0.04em" }}>
              AI INTELLIGENCE v3.0
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 14px 8px" }}>
          Platform
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link href={href} key={href} className={`nav-link ${isActive ? "active" : ""}`}>
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 16,
          padding: "14px",
          background: "rgba(139, 92, 246, 0.08)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          borderRadius: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Sparkles size={12} color="#8B5CF6" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#8B5CF6" }}>Champion-Challenger</span>
        </div>
        <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>
          Challenger running in shadow mode · 4 days remaining
        </div>
        <div
          style={{
            marginTop: 8,
            height: 4, background: "rgba(255,255,255,0.08)",
            borderRadius: 2, overflow: "hidden",
          }}
        >
          <div style={{ height: "100%", width: "43%", background: "linear-gradient(90deg, #8B5CF6, #3B82F6)", borderRadius: 2 }} />
        </div>
      </div>
    </aside>
  );
}
