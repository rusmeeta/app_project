import os

class Config:
    SECRET_KEY = "supersecretkey"

    # Correct database URI
    SQLALCHEMY_DATABASE_URI = "postgresql://kisanlink_user:password123@localhost:5432/kisanlink_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
