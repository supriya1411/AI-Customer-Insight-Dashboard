import os
import pandas as pd
import random
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from typing import List, Dict, Any

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "customers.csv")

# Global cache for models
_MODEL_CACHE = {
    "rf": None,
    "kmeans": None,
    "last_data_count": 0
}

def ensure_dummy_data() -> None:
    if os.path.exists(CSV_PATH):
        return

    print(f"Creating dummy dataset at {CSV_PATH}")
    data = []
    for i in range(100):
        # Generate some logical features where higher usage + more logins = lower churn
        customer_id = f"C-{(i+1):03d}"
        usage_score = round(random.uniform(0.1, 1.0), 2)
        login_days = random.randint(1, 30)
        support_tickets = random.randint(0, 10)
        
        # Determine pseudo ground-truth churned label
        # Higher score -> less likely to churn
        score = (usage_score * 30 + login_days) - (support_tickets * 2)
        churned = 1 if score < 15 else (1 if random.random() < 0.1 else 0)
        
        data.append({
            "customer_id": customer_id,
            "usage_score": usage_score,
            "login_days": login_days,
            "support_tickets": support_tickets,
            "churned": churned
        })
        
    df = pd.DataFrame(data)
    df.to_csv(CSV_PATH, index=False)

def get_insights() -> List[Dict[str, Any]]:
    # 1. Ensure data exists
    ensure_dummy_data()
    
    # 2. Read data
    df = pd.read_csv(CSV_PATH)
    
    # Needs at least these columns for our logic
    required_cols = ["customer_id", "usage_score", "login_days", "support_tickets", "churned"]
    for col in required_cols:
        if col not in df.columns:
            # Fallback if manual CSV is missing columns
            df[col] = 0
            if col == "customer_id":
                df[col] = [f"C-{i:03d}" for i in range(len(df))]
        
    # 3. Train/Load RandomForest model for Churn Prediction
    features = ["usage_score", "login_days", "support_tickets"]
    X = df[features]
    y = df["churned"]
    
    # Check if we can reuse cached models
    if _MODEL_CACHE["rf"] is None or _MODEL_CACHE["last_data_count"] != len(df):
        print(f"🔄 Training ML models (Data: {len(df)} rows)...")
        rf = RandomForestClassifier(n_estimators=50, random_state=42)
        rf.fit(X, y)
        
        # 4. Train KMeans for Segments
        kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
        kmeans.fit(X)
        
        # Update cache
        _MODEL_CACHE["rf"] = rf
        _MODEL_CACHE["kmeans"] = kmeans
        _MODEL_CACHE["last_data_count"] = len(df)
    else:
        rf = _MODEL_CACHE["rf"]
        kmeans = _MODEL_CACHE["kmeans"]

    churn_probabilities = rf.predict_proba(X)[:, 1]
    segments_idx = kmeans.predict(X)
    segment_map = {0: "Segment A", 1: "Segment B", 2: "Segment C"}
    
    results = []
    
    for i, row in df.iterrows():
        prob = round(float(churn_probabilities[i]), 3)
        segment = segment_map.get(segments_idx[i], "Unknown Segment")
        
        # 5. Rule-based Recommendation
        if prob >= 0.7:
            recommended_action = "CSM Priority Call"
        elif prob >= 0.4:
            recommended_action = "Retention Discount Email"
        else:
            recommended_action = "Standard Update Email"
            
        results.append({
            "customer_id": str(row["customer_id"]),
            "churn_probability": prob,
            "segment": segment,
            "recommended_action": recommended_action
        })
        
    return results
