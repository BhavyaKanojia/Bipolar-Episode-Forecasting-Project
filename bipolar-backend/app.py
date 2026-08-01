from flask import Flask, request, jsonify, g
from flask_cors import CORS
import pandas as pd
import pickle
from pymongo import MongoClient
import os
from datetime import datetime
from bson.objectid import ObjectId

# -----------------------------
# Initialize Flask App
# -----------------------------
app = Flask(__name__)
CORS(app)   # Enable CORS for React (localhost:5173)

# -----------------------------
# Setup MongoDB
# -----------------------------
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['bipolar_db']


# -----------------------------
# Load Trained Model & Encoder
# -----------------------------
model = pickle.load(open("model.pkl", "rb"))
label_encoder = pickle.load(open("label_encoder.pkl", "rb"))

# -----------------------------
# Predict Route
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # Convert input JSON to DataFrame
        input_df = pd.DataFrame([data])

        # Convert categorical columns to dummy variables
        input_df = pd.get_dummies(input_df)

        # Align input columns with training columns
        model_columns = model.feature_names_in_
        input_df = input_df.reindex(columns=model_columns, fill_value=0)

        # Make prediction
        prediction = model.predict(input_df)
        probabilities = model.predict_proba(input_df)

        # Convert encoded label back to original  
        disorder = label_encoder.inverse_transform(prediction)[0]

        # Calculate probabilities
        max_prob = max(probabilities[0])
        mania_prob = round(max_prob * 100)
        depression_risk = round((1 - max_prob) * 100)

        # Create response for dashboard
        response = {
            "mood_stability": disorder,
            "mania_probability": mania_prob,
            "depression_risk": depression_risk,
            "sleep_quality": data.get("Sleep", 7),
            "next_episode_risk": "Low" if mania_prob < 40 else "High",
            "summary": f"Prediction indicates {disorder} pattern."
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Auth & User Routes
# -----------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    
    user = db.users.find_one({"username": username, "password": password})
    if user:
        return jsonify({"success": True, "token": "dummy-jwt-token", "user_id": str(user["_id"]), "username": user["username"]})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"success": False, "error": "Username and password are required"}), 400
        
    try:
        if db.users.find_one({"username": username}):
            return jsonify({"success": False, "error": "Username already exists"}), 400
            
        result = db.users.insert_one({"username": username, "password": password})
        return jsonify({"success": True, "token": "dummy-jwt-token", "user_id": str(result.inserted_id), "username": username})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/logs", methods=["GET"])
def get_logs():
    user_id = request.args.get("user_id")
    query = {"user_id": user_id} if user_id else {}
    logs = list(db.logs.find(query).sort("date", -1).limit(20))
    for log in logs:
        log["id"] = str(log.pop("_id")) # Map MongoDB _id to string id
    return jsonify(logs)

@app.route("/api/logs", methods=["POST"])
def create_log():
    data = request.json
    log_entry = {
        "user_id": data.get("user_id", "1"),
        "date": data.get("date"),
        "mood": data.get("mood"),
        "energy": data.get("energy"),
        "sleep": data.get("sleep"),
        "notes": data.get("notes")
    }
    result = db.logs.insert_one(log_entry)
    return jsonify({"success": True, "id": str(result.inserted_id)})

@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    try:
        user_id = request.args.get("user_id")
        query = {"user_id": user_id} if user_id else {}
        latest_log = db.logs.find_one(query, sort=[("date", -1)])
        
        sleep_hours = latest_log["sleep"] if latest_log else 7.0
        mood_val = latest_log.get("mood", 1) if latest_log else 1
        energy_val = latest_log.get("energy", 5) if latest_log else 5
        
        input_data = {
            "Sadness": "Usually" if mood_val == 0 else ("Sometimes" if mood_val == 1 else "Seldom"),
            "Euphoric": "Usually" if mood_val == 2 else ("Sometimes" if mood_val == 1 else "Seldom"),
            "Exhausted": "Usually" if energy_val < 4 else ("Sometimes" if energy_val < 7 else "Seldom"),
            "Sleep dissorder": "Usually" if (sleep_hours < 5 or sleep_hours > 9) else "Seldom",
            "Mood Swing": "YES" if (mood_val == 0 or mood_val == 2) else "NO",
            "Optimisim": energy_val
        }
        
        input_df = pd.DataFrame([input_data])
        input_df = pd.get_dummies(input_df)
        model_columns = model.feature_names_in_
        input_df = input_df.reindex(columns=model_columns, fill_value=0)
        
        prediction = model.predict(input_df)
        probabilities = model.predict_proba(input_df)
        disorder = label_encoder.inverse_transform(prediction)[0]
        
        max_prob = max(probabilities[0])
        mania_prob = round(max_prob * 100)
        depression_risk = round((1 - max_prob) * 100)
        
        # Get chart data
        recent_logs = list(db.logs.find(query).sort("date", -1).limit(7))
        chart_data = []
        for l in reversed(recent_logs):
            chart_data.append({
                "day": l.get("date", "?")[-5:],
                "mood": l["mood"] * 3.33, # scale 0-2 to 1-10
                "sleep": l["sleep"]
            })

        response = {
            "mood_stability": "Stable" if disorder == "Normal" else disorder,
            "mania_probability": mania_prob,
            "depression_risk": depression_risk,
            "sleep_quality": sleep_hours,
            "next_episode_risk": "Low" if mania_prob < 40 else "High",
            "summary": f"Prediction indicates {disorder} pattern." if latest_log else "Log your first mood to get a prediction!",
            "has_data": latest_log is not None,
            "chart_data": chart_data
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/forecast", methods=["GET"])
def forecast():
    user_id = request.args.get("user_id")
    query = {"user_id": user_id} if user_id else {}
    
    # Fetch up to 28 days of history
    historical_logs = list(db.logs.find(query).sort("date", -1).limit(28))
    
    if len(historical_logs) < 7:
        return jsonify({
            "has_enough_data": False,
            "days_logged": len(historical_logs),
            "forecastData": [],
            "riskData": []
        })

    # Prepare model columns 
    model_columns = model.feature_names_in_
    predict_classes = label_encoder.classes_
    
    forecast_data = []
    weekly_risks = []
    
    # Process chronologically
    for index, l in enumerate(reversed(historical_logs)):
        # Feature Mapping
        mood_val = l.get("mood", 1)
        energy_val = l.get("energy", 5)
        sleep_val = l.get("sleep", 7.0)
        
        input_data = {
            "Sadness": "Usually" if mood_val == 0 else ("Sometimes" if mood_val == 1 else "Seldom"),
            "Euphoric": "Usually" if mood_val == 2 else ("Sometimes" if mood_val == 1 else "Seldom"),
            "Exhausted": "Usually" if energy_val < 4 else ("Sometimes" if energy_val < 7 else "Seldom"),
            "Sleep dissorder": "Usually" if (sleep_val < 5 or sleep_val > 9) else "Seldom",
            "Mood Swing": "YES" if (mood_val == 0 or mood_val == 2) else "NO",
            "Optimisim": energy_val
        }
        
        input_df = pd.DataFrame([input_data])
        input_df = input_df.reindex(columns=model_columns, fill_value=0)
        
        probabilities = model.predict_proba(input_df)[0]
        
        mania_prob = 0
        depression_prob = 0
        
        for i, cls_name in enumerate(predict_classes):
            prob = probabilities[i] * 100
            # Rough heuristic grouping based on common target variables in such datasets
            name_lower = str(cls_name).lower()
            if "1" in name_lower or "mania" in name_lower:
                mania_prob += prob
            elif "2" in name_lower or "depression" in name_lower:
                depression_prob += prob
            else:
                # If neutral/normal, consider it as lowering extremes or evenly distributing
                pass
                
        # To avoid zeros if classes are named differently, fallback mathematically to simplistic baseline
        if mania_prob == 0 and depression_prob == 0:
            extreme_risk = (max(probabilities) * 100)
            mania_prob = extreme_risk / 2
            depression_prob = extreme_risk / 2
        else:
            extreme_risk = max(mania_prob, depression_prob)
            
        # Build 7-Day Line Chart context (last 7 items from reversed list)
        if index >= len(historical_logs) - 7:
            actual_severity = round(((abs((mood_val - 1)) * 5) + (abs(energy_val - 5))), 1) 
            forecast_data.append({
                "day": l.get("date", "?")[-5:],
                "predicted": round(extreme_risk / 10, 1), # Scale 0-100 to 0-10
                "actual": actual_severity if actual_severity <= 10 else 10.0
            })
            
        weekly_risks.append({
            "mania": mania_prob,
            "depression": depression_prob
        })

    # Group into 4 weeks
    risk_data = []
    chunk_size = 7
    for i in range(0, len(weekly_risks), chunk_size):
        week_chunk = weekly_risks[i:i+chunk_size]
        avg_mania = sum([w['mania'] for w in week_chunk]) / len(week_chunk)
        avg_depress = sum([w['depression'] for w in week_chunk]) / len(week_chunk)
        week_num = (i // chunk_size) + 1
        risk_data.append({
            "week": f"W{week_num}",
            "mania": round(avg_mania),
            "depression": round(avg_depress)
        })
        
    return jsonify({
        "has_enough_data": True,
        "forecastData": forecast_data,
        "riskData": risk_data
    })

# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)