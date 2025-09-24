from db import get_db_connection

conn = get_db_connection()
if conn:
    print("Database connected successfully!")
    conn.close()
else:
    print("Failed to connect to database.")
