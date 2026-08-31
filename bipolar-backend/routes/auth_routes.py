from flask import Blueprint, request, jsonify
from database import get_db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"success": False, "error": "Username and password are required"}), 400

        db = get_db()
        user = db.users.find_one({"username": username, "password": password})
        
        if user:
            return jsonify({
                "success": True,
                "token": "auth-token-session",
                "user_id": str(user["_id"]),
                "username": user["username"]
            })
        return jsonify({"success": False, "error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@auth_bp.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.json or {}
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"success": False, "error": "Username and password are required"}), 400
            
        db = get_db()
        if db.users.find_one({"username": username}):
            return jsonify({"success": False, "error": "Username already exists"}), 400
            
        result = db.users.insert_one({"username": username, "password": password})
        return jsonify({
            "success": True,
            "token": "auth-token-session",
            "user_id": str(result.inserted_id),
            "username": username
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
