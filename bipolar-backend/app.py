from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import init_db

# Import modular route blueprints
from routes.auth_routes import auth_bp
from routes.logs_routes import logs_bp
from routes.dashboard_routes import dashboard_bp
from routes.forecast_routes import forecast_bp
from routes.predict_routes import predict_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable Cross-Origin Resource Sharing for Netlify frontend

    # Initialize Database connection
    init_db()

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(logs_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(forecast_bp)
    app.register_blueprint(predict_bp)

    @app.route("/")
    def health():
        return jsonify({
            "status": "online",
            "service": "Bipolar Episode Forecasting API",
            "version": "2.0.0"
        })

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=False)