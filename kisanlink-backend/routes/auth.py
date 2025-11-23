# -----------------------------
# routes/auth.py
# -----------------------------

from flask import Blueprint, request, jsonify, session  # Flask tools
from db import get_db_connection  # Function to connect to PostgreSQL
from datetime import datetime      # For timestamps (if needed)

# -----------------------------
# Create Blueprint
# -----------------------------
# Blueprint groups all auth-related routes under /auth prefix
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# -----------------------------
# Predefined location coordinates
# -----------------------------
# Each location maps to a latitude & longitude
# This allows automatic geolocation for users on signup
location_coords = {
    "Naya Thimi": (27.6943, 85.3347),
    "Gatthaghar": (27.6739136, 85.3739132),
    "Kausaltar": (27.6745787, 85.3642978),
    "Lokanthali": (27.6740, 85.3450),
}

# -----------------------------
# SIGNUP API
# -----------------------------
@auth_bp.route('/signup', methods=['POST'])
def signup_api():
    """
    Signup new users (farmer, consumer, admin)
    1. Validates input fields
    2. Automatically sets latitude & longitude
    3. Inserts into 'users' table
    """
    data = request.get_json()  # Get JSON payload from frontend

    # Extract fields
    fullname = data.get('fullname')
    email = data.get('email')
    password = data.get('password')
    location = data.get('location')
    user_type = data.get('user_type')  # farmer/consumer/admin

    # -----------------------------
    # Validate input
    # -----------------------------
    if not all([fullname, email, password, location, user_type]):
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    # -----------------------------
    # Get latitude & longitude
    # -----------------------------
    latitude, longitude = location_coords.get(location, (None, None))

    # -----------------------------
    # Connect to database
    # -----------------------------
    conn = get_db_connection()
    cur = conn.cursor()

    # -----------------------------
    # Check if email already exists
    # -----------------------------
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"status": "error", "message": "Email already exists"}), 400

    # -----------------------------
    # Insert user into database
    # -----------------------------
    cur.execute("""
        INSERT INTO users (fullname, email, password_hash, location, user_type, latitude, longitude)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (fullname, email, password, location, user_type, latitude, longitude))

    user_id = cur.fetchone()[0]  # Get the newly inserted user's ID

    conn.commit()   # Save changes
    cur.close()
    conn.close()    # Close connection

    # -----------------------------
    # Return response
    # -----------------------------
    return jsonify({"status": "success", "message": "Signup successful", "user_id": user_id}), 201


# -----------------------------
# LOGIN API
# -----------------------------
@auth_bp.route('/login', methods=['POST'])
def login_api():
    """
    Login user
    1. Checks email and password
    2. Sets Flask session
    3. Returns user info including user_type for frontend redirect
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()

    # -----------------------------
    # Fetch user from DB
    # -----------------------------
    cur.execute(
        "SELECT id, password_hash, user_type, fullname FROM users WHERE email=%s",
        (email,)
    )
    user = cur.fetchone()
    if not user:
        cur.close()
        conn.close()
        return {"status": "error", "message": "Email not found"}, 404

    user_id, db_password, user_type, fullname = user

    # -----------------------------
    # Check password
    # -----------------------------
    if password != db_password:  # For production, replace with hashed password check
        cur.close()
        conn.close()
        return {"status": "error", "message": "Incorrect password"}, 401

    # -----------------------------
    # Set session variables
    # -----------------------------
    session['user_id'] = user_id       # Track logged-in user
    session['user_type'] = user_type   # Track role (farmer/consumer/admin)

    cur.close()
    conn.close()

    # -----------------------------
    # Return login success
    # -----------------------------
    return {
        "status": "success",
        "message": "Logged in successfully",
        "user_id": user_id,
        "user_type": user_type,
        "fullname": fullname
    }, 200


# -----------------------------
# LOGOUT API
# -----------------------------
@auth_bp.route('/logout', methods=['POST'])
def logout_api():
    """
    Logout user by clearing session
    """
    session.clear()
    return {"status": "success", "message": "Logged out successfully"}, 200


# -----------------------------
# GET CURRENT USER API
# -----------------------------
@auth_bp.route('/me', methods=['GET'])
def me_api():
    """
    Returns the current logged-in user
    Can be used by frontend to check if user is authenticated
    """
    if 'user_id' not in session:
        return {"authenticated": False}, 401

    return {
        "authenticated": True,
        "user_id": session['user_id'],
        "user_type": session['user_type']
    }
