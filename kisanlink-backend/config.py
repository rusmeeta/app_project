import os

class Config:
    SECRET_KEY = "supersecretkey"
    SQLALCHEMY_DATABASE_URI = "sqlite:///kisanlink.db"  # or your Postgres URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
