import os

class Config:
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    PORT = int(os.environ.get("PORT", 5000))
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
    ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
