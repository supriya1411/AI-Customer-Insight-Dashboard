import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# 📁 Load data
df = pd.read_csv("../../customers.csv")

# 🎯 Target column check
TARGET = "churned"
if TARGET not in df.columns:
    raise ValueError("❌ 'churned' column missing in customers.csv")

# 🧹 Drop useless columns (IDs / names)
drop_cols = ["customer_id", "name"]
df = df.drop(columns=[col for col in drop_cols if col in df.columns])

# 🔄 Encode categorical columns
encoders = {}
for col in df.select_dtypes(include='object').columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# 🎯 Features & Target
X = df.drop(TARGET, axis=1)
y = df[TARGET]

# ✂️ Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 🤖 Model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 📊 Accuracy
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"✅ Model Accuracy: {acc:.4f}")

# 💾 Save model + encoders + columns
joblib.dump({
    "model": model,
    "encoders": encoders,
    "columns": X.columns.tolist()
}, "../churn_model.pkl")

print("🔥 Model trained & saved successfully!")