import psycopg2
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="kisanlink_db",
            user="kisanlink_user",
            password="password123"
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None
