from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # Allow React/Express to talk to this Python server

# 1. Load the Brain (The model you just trained)
print("🧠 Loading AI Model...")
model = joblib.load("mess_waste_model.pkl")
print("✅ Model loaded successfully!")

@app.route('/', methods=['GET'])
def home():
    return "AI Engine is Running! 🚀 Send POST requests to /predict"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 2. Get data from the request
        data = request.json
        # Expected JSON: {"day_of_week": 0, "is_weekend": 0, "is_special_event": 0, "attendance": 1200}

        # 3. Convert to DataFrame (Format the model understands)
        # We ensure columns match exactly what we trained on
        features = ['day_of_week', 'is_weekend', 'is_special_event', 'attendance']
        df = pd.DataFrame([data], columns=features)

        # 4. Ask the Brain
        prediction = model.predict(df)
        result = round(prediction[0], 2)

        return jsonify({
            "status": "success",
            "predicted_waste_kg": result,
            "message": f"Predicted waste for {data['attendance']} students is {result} kg"
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    # Run on Port 5001 to avoid conflict with Node.js (Port 5000)
    print("🔥 AI Server starting on http://127.0.0.1:5001")
    app.run(port=5001, debug=True)