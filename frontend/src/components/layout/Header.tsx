"use client";
import { Bell, Search, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <header
      style={{
        height: 64,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(5,11,24,0.85)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 420, position: "relative" }}>
        <Search
          size={14}
          color="#475569"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
        />
        <input
          className="acias-input"
          placeholder="Search customers, segments, actions…"
          style={{ paddingLeft: 36, height: 38 }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="pulse-dot" />
        <span style={{ fontSize: 12, color: "#10B981", fontWeight: 500 }}>Live</span>
      </div>

      {/* Actions */}
      <button
        onClick={handleRefresh}
        className="btn-ghost"
        style={{ padding: "8px", display: "flex", alignItems: "center" }}
        title="Refresh data"
      >
        <RefreshCw size={15} style={{ transition: "transform 0.6s ease", transform: refreshing ? "rotate(360deg)" : "rotate(0deg)" }} />
      </button>

      <button className="btn-ghost" style={{ padding: "8px", position: "relative" }}>
        <Bell size={15} />
        <div
          style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8, borderRadius: "50%",
            background: "#F43F5E",
            border: "2px solid #050B18",
          }}
        />
      </button>

      {/* Avatar */}
      <div
        style={{
          width: 34, height: 34,
          borderRadius: 10,
          background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "white",
          cursor: "pointer",
        }}
      >
        A
      </div>
    </header>
  );
}
