import time
from flask import Blueprint, request, jsonify
from database import get_db
from ml_service import ml_service
from ai_service import ai_service

ai_bp = Blueprint("ai", __name__)

def get_user_telemetry_context(user_id):
    """Retrieves user's latest log, ML prediction, and recent history for AI grounding."""
    try:
        db = get_db()
        query = {"user_id": str(user_id)} if user_id else {}
        
        latest_log = db.logs.find_one(query, sort=[("date", -1)])
        if not latest_log:
            return None, []

        sleep_hours = float(latest_log.get("sleep", 7.0))
        mood_val = int(latest_log.get("mood", 1))
        energy_val = int(latest_log.get("energy", 5))
        recent_notes = latest_log.get("notes", "")

        prediction = ml_service.predict_log(mood_val, energy_val, sleep_hours)
        
        user_context = {
            "disorder": prediction.get("disorder", "Normal"),
            "mood_stability": prediction.get("mood_stability", "Stable"),
            "mania_probability": prediction.get("mania_probability", 0),
            "depression_risk": prediction.get("depression_risk", 0),
            "sleep_quality": sleep_hours,
            "next_episode_risk": prediction.get("next_episode_risk", "Low"),
            "confidence": prediction.get("confidence", 80),
            "recent_notes": recent_notes
        }

        recent_logs = list(db.logs.find(query).sort("date", -1).limit(5))
        for r in recent_logs:
            r["_id"] = str(r["_id"])

        return user_context, recent_logs
    except Exception as e:
        print(f"Error fetching telemetry context: {e}")
        return None, []

@ai_bp.route("/api/chat", methods=["POST"])
def chat():
    """
    Mental Health Companion chat endpoint powered by Groq LLM.
    Accepts conversation messages and optional user_id for context-aware grounding.
    """
    try:
        data = request.json or {}
        messages = data.get("messages", [])
        user_id = data.get("user_id")

        if not messages:
            return jsonify({"error": "No messages provided"}), 400

        # Retrieve real-time telemetry if available
        user_context, _ = get_user_telemetry_context(user_id)

        ai_reply = ai_service.chat_companion(messages, user_context=user_context)

        return jsonify({
            "id": int(time.time() * 1000),
            "role": "ai",
            "text": ai_reply,
            "has_context": user_context is not None,
            "user_context": user_context
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "role": "ai",
            "text": "I encountered an error connecting to my neural core. Please try again in a moment."
        }), 500

@ai_bp.route("/api/ai/insights", methods=["GET", "POST"])
def clinical_insights():
    """
    Generates dynamic clinical insights and coping plan using Groq LLM
    based on the user's latest ML predictions and sleep/mood trends.
    """
    try:
        user_id = request.args.get("user_id")
        if not user_id and request.is_json:
            user_id = (request.json or {}).get("user_id")

        user_context, recent_logs = get_user_telemetry_context(user_id)

        if not user_context:
            # Baseline insights for new users without logs
            user_context = {
                "disorder": "Normal",
                "mood_stability": "Baseline",
                "mania_probability": 0,
                "depression_risk": 0,
                "sleep_quality": 7.0,
                "next_episode_risk": "Low",
                "confidence": 100
            }

        insights = ai_service.generate_clinical_insights(user_context, recent_logs)

        return jsonify({
            "success": True,
            "insights": insights,
            "metrics": user_context
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@ai_bp.route("/api/ai/explain", methods=["POST"])
def explain_features():
    """
    Explains the machine learning model prediction based on behavioral input features.
    """
    try:
        data = request.json or {}
        feature_dict = data.get("features", {})
        prediction_res = data.get("prediction", {})
        
        explanation = ai_service.explain_prediction(feature_dict, prediction_res)
        return jsonify({"explanation": explanation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/api/ai/transcribe", methods=["POST"])
def transcribe():
    """
    Voice-to-text audio transcription powered by Groq Whisper model.
    """
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files["audio"]
        if audio_file.filename == "":
            return jsonify({"error": "Empty audio file"}), 400

        filename = audio_file.filename or "recording.webm"
        file_tuple = (filename, audio_file.read(), audio_file.content_type or "audio/webm")
        
        transcription_text = ai_service.transcribe_audio(file_tuple)
        return jsonify({"text": transcription_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
