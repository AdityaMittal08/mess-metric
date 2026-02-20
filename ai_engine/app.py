from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
from textblob import TextBlob  # 👈 NEW: NLP Library

app = Flask(__name__)
CORS(app)

# --- 1. Load Waste Prediction Model ---
print("🧠 Loading AI Model...")
try:
    model = joblib.load("mess_waste_model.pkl")
    print("✅ Waste Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Waste Model not found. ({e})")
    model = None

@app.route('/', methods=['GET'])
def home():
    return "AI Engine is Running! 🚀 Routes: /predict (POST), /analyze-feedback (POST)"

# --- 2. Existing Route: Waste Prediction ---
@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not model:
            return jsonify({"status": "error", "message": "Model not loaded"})
            
        data = request.json
        # Expected JSON: {"day_of_week": 0, "is_weekend": 0, "is_special_event": 0, "attendance": 1200}

        features = ['day_of_week', 'is_weekend', 'is_special_event', 'attendance']
        df = pd.DataFrame([data], columns=features)

        prediction = model.predict(df)
        result = round(prediction[0], 2)

        return jsonify({
            "status": "success",
            "predicted_waste_kg": result,
            "message": f"Predicted waste for {data['attendance']} students is {result} kg"
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# --- 3. NEW Route: Sentiment Analysis ---
@app.route('/analyze-feedback', methods=['POST'])
def analyze_feedback():
    try:
        # Get text from request
        data = request.json
        text = data.get('feedback', '')

        if not text:
            return jsonify({"status": "error", "message": "No feedback text provided"})

        # AI Analysis
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # Score: -1.0 (Bad) to +1.0 (Good)
        
        # Determine Mood
        if polarity > 0.1:
            mood = "Positive 😊"
            color = "text-green-600"
        elif polarity < -0.1:
            mood = "Negative 😡"
            color = "text-red-600"
        else:
            mood = "Neutral 😐"
            color = "text-gray-600"

        # Extract Keywords (Noun Phrases)
        keywords = blob.noun_phrases

        return jsonify({
            "status": "success",
            "analysis": {
                "score": round(polarity, 2),
                "mood": mood,
                "color": color,
                "keywords": keywords
            }
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/procurement', methods=['POST'])
def calculate_procurement():
    try:
        data = request.json
        students = data.get('students', 0)

        if not students or students <= 0:
            return jsonify({"status": "error", "message": "Invalid student count"})

        # Standard baseline multipliers per student (in kg or Liters)
        # You can tweak these based on real mess metrics
        procurement_data = [
            {"name": "Rice (Basmati)", "qty": f"{round(students * 0.15, 1)} kg"},
            {"name": "Yellow Dal", "qty": f"{round(students * 0.05, 1)} kg"},
            {"name": "Mixed Vegetables", "qty": f"{round(students * 0.20, 1)} kg"},
            {"name": "Cooking Oil", "qty": f"{round(students * 0.02, 1)} L"},
            {"name": "Wheat Flour (Atta)", "qty": f"{round(students * 0.12, 1)} kg"}
        ]

        return jsonify({
            "status": "success",
            "data": procurement_data
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    # Get port from environment variable or use 5001 for local
    port = int(os.environ.get("PORT", 5001)) 
    print(f"🔥 AI Server starting on Port {port}")
    # Host must be 0.0.0.0 to be accessible outside the container
    app.run(host='0.0.0.0', port=port)