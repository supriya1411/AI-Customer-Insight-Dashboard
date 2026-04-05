import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import pickle
import os

def train():
    filepath = "customers.csv"
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return
    
    df = pd.read_csv(filepath)
    
    # Features for the model
    features = [
        "tenure", "monthly_spend", "usage_frequency", 
        "feature_usage_score", "support_tickets_30d", 
        "billing_failures_30d", "nps_score", "expansion_events"
    ]
    target = "churned"
    
    X = df[features]
    y = df[target]
    
    # Create an ML Pipeline with scaling and RandomForest
    model = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestClassifier(n_estimators=100, random_state=42, max_depth=5))
    ])
    
    model.fit(X, y)
    
    # Save the pipeline
    with open("app/churn_model.pkl", "wb") as f:
        pickle.dump(model, f)
        
    print("Model trained and saved to app/churn_model.pkl")

if __name__ == "__main__":
    train()
