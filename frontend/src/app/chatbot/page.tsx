"use client";
import { useEffect, useState, useRef } from "react";
import { sendChat } from "@/lib/api";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; timestamp: Date; }

const SUGGESTIONS = [
  "Which customers are at critical churn risk?",
  "Show me today's KPI summary",
  "What's our current NRR?",
  "Which segment has the highest MRR at risk?",
  "How is the churn model performing?",
  "Show me the Expansion Ready segment",
  "What actions are pending for CSM?",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 **Welcome to ACIAS AI Analyst**\n\nI have real-time access to your customer data, segment intelligence, ML model metrics, and action recommendation pipeline.\n\nAsk me anything — from churn risk analysis to NRR forecasts.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>(SUGGESTIONS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || loading) return;
    const userMsg: Message = { role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await sendChat(msg, history);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.response,
        timestamp: new Date(),
      }]);
      setFollowUps(res.follow_up_suggestions || []);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ **Connection Error**\n\nCould not reach the ACIAS backend. Please ensure the API server is running on port 8000.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Simple markdown-like line formatting
  const formatContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <div key={i} style={{ fontWeight: 700, color: "#E2E8F0", marginBottom: 2 }}>{line.replace(/\*\*/g, "")}</div>;
      }
      if (line.startsWith("• ")) {
        return <div key={i} style={{ paddingLeft: 12, color: "#94A3B8", marginBottom: 2 }}>{line}</div>;
      }
      if (line === "") return <div key={i} style={{ height: 6 }} />;
      // Handle **bold** inline
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <div key={i} style={{ marginBottom: 2 }}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#E2E8F0" }}>{p}</strong> : p)}
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: 0 }} className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
          AI Analyst
        </h1>
        <p style={{ fontSize: 14, color: "#64748B" }}>
          Natural-language interface · Ask anything about your customers, segments, and ML models
        </p>
      </div>

      {/* Chat Window */}
      <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeInUp 0.3s ease" }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginTop: 2,
                background: msg.role === "assistant"
                  ? "linear-gradient(135deg, #3B82F6, #8B5CF6)"
                  : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {msg.role === "assistant" ? <Bot size={14} color="white" /> : <User size={14} color="#94A3B8" />}
              </div>

              {/* Bubble */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: msg.role === "assistant" ? "#3B82F6" : "#F1F5F9" }}>
                    {msg.role === "assistant" ? "ACIAS AI" : "You"}
                  </span>
                  <span style={{ fontSize: 10, color: "#334155" }}>{formatTime(msg.timestamp)}</span>
                </div>
                <div
                  className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
                  style={{ display: "inline-block", maxWidth: "90%", lineHeight: 1.7 }}
                >
                  {formatContent(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={14} color="white" />
              </div>
              <div className="chat-bubble-ai" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Loader2 size={14} color="#3B82F6" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ color: "#64748B", fontSize: 13 }}>Analyzing your data…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Follow-up Suggestions */}
        {followUps.length > 0 && (
          <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Sparkles size={12} color="#8B5CF6" style={{ marginTop: 6 }} />
            {followUps.slice(0, 3).map((s, i) => (
              <button key={i} className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10 }}>
          <input
            id="chat-input"
            className="acias-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about churn, CLV, segments, actions…"
            disabled={loading}
          />
          <button
            className="btn-primary"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}
          >
            {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
