import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

# 1. Load the fake data
df = pd.read_csv("mess_data.csv")

# 2. Select Features (Inputs) and Target (Output)
# We want to predict 'waste_kg' based on day, event type, etc.
# We need to convert text to numbers for the machine.
df['is_special_event'] = df['event_type'].apply(lambda x: 1 if x == "Special" else 0)

features = ['day_of_week', 'is_weekend', 'is_special_event', 'attendance']
target = 'waste_kg'

X = df[features]
y = df[target]

# 3. Split into Training (80%) and Testing (20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train the Model (Random Forest is good for robust prototyping)
model = RandomForestRegressor(n_estimators=100, random_state=42)
print("🧠 Training the AI model...")
model.fit(X_train, y_train)

# 5. Evaluate
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
print(f"✅ Model Trained! Average Error: ±{mae:.2f} kg")

# 6. Save the Brain
joblib.dump(model, "mess_waste_model.pkl")
print("💾 Model saved as 'mess_waste_model.pkl'")