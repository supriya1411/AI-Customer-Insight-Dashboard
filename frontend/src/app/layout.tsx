import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "ACIAS — AI Customer Intelligence & Action System",
  description:
    "Production-grade ML platform for churn prediction, CLV modeling, customer segmentation, and automated action recommendations. Built for 500K+ MAU SaaS companies.",
  keywords: ["AI", "customer intelligence", "churn prediction", "CLV", "ML platform"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="mesh-bg" />
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Header />
            <main
              style={{
                flex: 1,
                padding: "28px 32px",
                overflowY: "auto",
                maxHeight: "calc(100vh - 64px)",
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
