from flask import Blueprint, request, jsonify
from ml_service import ml_service
from ai_service import ai_service

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/predict", methods=["POST"])
@predict_bp.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json or {}
        prediction_res = ml_service.predict_from_features(data)
        
        # Generate Groq AI explanation
        ai_explanation = ai_service.explain_prediction(data, prediction_res)

        response = {
            "mood_stability": prediction_res["mood_stability"],
            "disorder": prediction_res["disorder"],
            "mania_probability": prediction_res["mania_probability"],
            "depression_risk": prediction_res["depression_risk"],
            "sleep_quality": data.get("Sleep", 7),
            "next_episode_risk": prediction_res["next_episode_risk"],
            "confidence": prediction_res["confidence"],
            "class_probabilities": prediction_res["class_probabilities"],
            "summary": f"Prediction indicates {prediction_res['disorder']} pattern.",
            "ai_explanation": ai_explanation
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

