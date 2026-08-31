from pymongo import MongoClient
from config import Config

client = None
db = None

def init_db():
    global client, db
    if db is None:
        client = MongoClient(Config.MONGO_URI)
        db = client['bipolar_db']
    return db

def get_db():
    global db
    if db is None:
        return init_db()
    return db
