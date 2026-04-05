import os
import random
import csv
from datetime import datetime, timedelta

def generate_csv(filepath="customers.csv", n=500):
    random.seed(42)
    INDUSTRIES = ["FinTech", "HealthTech", "E-Commerce", "SaaS", "Retail", "Logistics"]
    PLANS = ["starter", "growth", "professional", "enterprise"]
    
    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "customer_id", "name", "industry", "plan",
            "tenure", "monthly_spend", "usage_frequency", 
            "feature_usage_score", "support_tickets_30d", 
            "billing_failures_30d", "nps_score", "expansion_events", "churned"
        ])
        
        for i in range(n):
            cid = f"CUST-{(10000 + i):05d}"
            name = f"Customer {(i + 1):04d}"
            industry = random.choice(INDUSTRIES)
            plan = random.choices(PLANS, weights=[30, 35, 25, 10])[0]
            
            tenure = int(random.gauss(540, 300))
            tenure = max(30, min(2000, tenure))
            
            mrr_base = {"starter": 99, "growth": 299, "professional": 799, "enterprise": 2499}[plan]
            monthly_spend = round(mrr_base * random.uniform(0.9, 1.2), 2)
            
            usage_frequency = int(max(0, min(60, random.gauss(18, 8))))
            feature_usage_score = round(max(0.0, min(1.0, random.gauss(0.55, 0.2))), 3)
            support_tickets_30d = int(max(0, min(15, random.gauss(2.1, 1.8))))
            billing_failures_30d = int(max(0, min(5, random.gauss(0.4, 0.8))))
            nps_score = int(max(0, min(10, random.gauss(7.2, 2.0))))
            expansion_events = int(max(0, min(8, random.gauss(1.2, 1.5))))
            
            # Simple churn calculation to make the ML target realistic
            churn_raw = (
                0.3 * (1 - feature_usage_score)
                + 0.25 * (support_tickets_30d / 15)
                + 0.2 * (billing_failures_30d / 5)
                + 0.15 * (1 - min(usage_frequency / 30, 1))
                + 0.1 * ((10 - nps_score) / 10)
            )
            churn_prob = round(max(0.02, min(0.97, churn_raw + random.gauss(0, 0.08))), 4)
            churned = 1 if (churn_prob > 0.50 and random.random() < churn_prob) else 0
            
            writer.writerow([
                cid, name, industry, plan,
                tenure, monthly_spend, usage_frequency,
                feature_usage_score, support_tickets_30d,
                billing_failures_30d, nps_score, expansion_events, churned
            ])
            
if __name__ == "__main__":
    generate_csv("customers.csv")
    print("Generated customers.csv successfully.")
