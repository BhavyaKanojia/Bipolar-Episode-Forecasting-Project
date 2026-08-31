from flask import Blueprint, request, jsonify
from database import get_db
from ml_service import ml_service

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/api/dashboard", methods=["GET"])
def dashboard():
    try:
        user_id = request.args.get("user_id")
        query = {"user_id": user_id} if user_id else {}
        db = get_db()
        
        latest_log = db.logs.find_one(query, sort=[("date", -1)])
        
        if latest_log:
            sleep_hours = float(latest_log.get("sleep", 7.0))
            mood_val = int(latest_log.get("mood", 1))
            energy_val = int(latest_log.get("energy", 5))
            
            # Predict using authentic ML model probabilities
            prediction_res = ml_service.predict_log(mood_val, energy_val, sleep_hours)
            
            disorder = prediction_res["disorder"]
            mood_stability = prediction_res["mood_stability"]
            mania_prob = prediction_res["mania_probability"]
            depression_risk = prediction_res["depression_risk"]
            risk_level = prediction_res["next_episode_risk"]
            summary_text = f"Model predicts {disorder} pattern with {prediction_res['confidence']}% confidence."
        else:
            sleep_hours = 7.0
            mood_stability = "Stable"
            mania_prob = 0
            depression_risk = 0
            risk_level = "Low"
            summary_text = "Log your first daily mood to receive personalized AI forecasting."

        # Fetch recent 7 logs for chart
        recent_logs = list(db.logs.find(query).sort("date", -1).limit(7))
        chart_data = []
        for l in reversed(recent_logs):
            chart_data.append({
                "day": str(l.get("date", "?"))[-5:],
                "mood": round(float(l.get("mood", 1)) * 3.33 + 1.0, 1), # scaled 1-10
                "sleep": float(l.get("sleep", 7.0))
            })

        response = {
            "mood_stability": mood_stability,
            "mania_probability": mania_prob,
            "depression_risk": depression_risk,
            "sleep_quality": sleep_hours,
            "next_episode_risk": risk_level,
            "summary": summary_text,
            "has_data": latest_log is not None,
            "chart_data": chart_data
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
