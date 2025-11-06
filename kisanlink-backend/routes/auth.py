from flask import Blueprint, request, jsonify, session
from db import get_db_connection
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# -------- Location Coordinates Mapping --------
location_coords = {
    "Naya Thimi": (27.6943, 85.3347),
    "Gatthaghar": (27.6739136, 85.3739132),
    "Kausaltar": (27.6745787, 85.3642978),
    "Lokanthali": (27.6740, 85.3450),
}

# -------- SIGNUP API --------
@auth_bp.route('/signup', methods=['POST'])
def signup_api():
    data = request.get_json()
    fullname = data.get('fullname')
    email = data.get('email')
    password = data.get('password')
    location = data.get('location')
    user_type = data.get('user_type')  # farmer/consumer

    if not all([fullname, email, password, location, user_type]):
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    # Get latitude and longitude automatically from location
    latitude, longitude = location_coords.get(location, (None, None))

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if email already exists
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        return jsonify({"status": "error", "message": "Email already exists"}), 400

    # Insert user with latitude and longitude
    cur.execute("""
        INSERT INTO users (fullname, email, password_hash, location, user_type, latitude, longitude)
        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
    """, (fullname, email, password, location, user_type, latitude, longitude))

    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": "success", "message": "Signup successful", "user_id": user_id}), 201

from datetime import datetime

@auth_bp.route('/login', methods=['POST'])
def login_api():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, fullname, user_type, password_hash, login_count, last_login
        FROM users WHERE email=%s
    """, (email,))
    user = cur.fetchone()
    if not user:
        return jsonify({"status": "error", "message": "Email not found"}), 404

    user_id, fullname, user_type, db_password, login_count, last_login = user
    if password != db_password:
        return jsonify({"status": "error", "message": "Incorrect password"}), 401

    # Update login_count and last_login in database
    cur.execute("""
        UPDATE users
        SET login_count = login_count + 1,
            last_login = %s
        WHERE id = %s
    """, (datetime.now(), user_id))
    conn.commit()
    cur.close()
    conn.close()

    # Return only necessary info
    return jsonify({
        "status": "success",
        "message": "Login successful",
        "user": {
            "id": user_id,
            "fullname": fullname,
            "user_type": user_type
        }
    })
