from flask import Blueprint, request, jsonify
from database import get_db
from ml_service import ml_service

forecast_bp = Blueprint("forecast", __name__)

@forecast_bp.route("/api/forecast", methods=["GET"])
def forecast():
    try:
        user_id = request.args.get("user_id")
        query = {"user_id": user_id} if user_id else {}
        db = get_db()
        
        # Fetch up to 28 days of history
        historical_logs = list(db.logs.find(query).sort("date", -1).limit(28))
        
        if len(historical_logs) < 7:
            return jsonify({
                "has_enough_data": False,
                "days_logged": len(historical_logs),
                "forecastData": [],
                "riskData": []
            })

        forecast_data = []
        weekly_risks = []
        
        # Process chronologically
        for index, l in enumerate(reversed(historical_logs)):
            mood_val = int(l.get("mood", 1))
            energy_val = int(l.get("energy", 5))
            sleep_val = float(l.get("sleep", 7.0))
            
            # Predict daily risk with ML
            pred = ml_service.predict_log(mood_val, energy_val, sleep_val)
            mania_prob = pred["mania_probability"]
            depression_prob = pred["depression_risk"]
            highest_risk = max(mania_prob, depression_prob)
            
            # 7-Day Line Chart context (last 7 days)
            if index >= len(historical_logs) - 7:
                actual_severity = round(((abs(mood_val - 1) * 5) + abs(energy_val - 5)), 1)
                forecast_data.append({
                    "day": str(l.get("date", "?"))[-5:],
                    "predicted": round(highest_risk / 10.0, 1), # Scale 0-100 to 0-10
                    "actual": min(10.0, actual_severity)
                })
                
            weekly_risks.append({
                "mania": mania_prob,
                "depression": depression_prob
            })

        # Group into weekly chunks
        risk_data = []
        chunk_size = 7
        for i in range(0, len(weekly_risks), chunk_size):
            week_chunk = weekly_risks[i:i + chunk_size]
            avg_mania = sum(w["mania"] for w in week_chunk) / len(week_chunk)
            avg_depress = sum(w["depression"] for w in week_chunk) / len(week_chunk)
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
    except Exception as e:
        return jsonify({"error": str(e)}), 500
