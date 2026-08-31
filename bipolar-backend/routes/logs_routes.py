from flask import Blueprint, request, jsonify
from database import get_db

logs_bp = Blueprint("logs", __name__)

@logs_bp.route("/api/logs", methods=["GET"])
def get_logs():
    try:
        user_id = request.args.get("user_id")
        query = {"user_id": user_id} if user_id else {}
        db = get_db()
        logs = list(db.logs.find(query).sort("date", -1).limit(30))
        for log in logs:
            log["id"] = str(log.pop("_id"))
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@logs_bp.route("/api/logs", methods=["POST"])
def create_log():
    try:
        data = request.json or {}
        log_entry = {
            "user_id": str(data.get("user_id", "1")),
            "date": data.get("date"),
            "mood": int(data.get("mood", 1)),
            "energy": int(data.get("energy", 5)),
            "sleep": float(data.get("sleep", 7.0)),
            "notes": data.get("notes", "")
        }
        db = get_db()
        result = db.logs.insert_one(log_entry)
        return jsonify({"success": True, "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
