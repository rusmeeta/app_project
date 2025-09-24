import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",          # or your DB host
            database="kisanlink_db",   # your DB name
            user="kisanlink_user",     # your DB user
            password="password123"   # your DB password
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

