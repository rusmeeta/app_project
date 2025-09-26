from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from db import get_db_connection
# from werkzeug.security import generate_password_hash, check_password_hash  # Uncomment for production

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# ------------------ SIGNUP ------------------
@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup_page():
    if request.method == 'POST':
        fullname = request.form['fullname']
        email = request.form['email']
        password = request.form['password']
        location = request.form['location']
        user_type = request.form['user_type']  # farmer, consumer, admin

        conn = get_db_connection()
        if not conn:
            flash("Database connection failed.", "error")
            return render_template('signup.html')

        cur = conn.cursor()

        # Check if email already exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            flash("Email already exists. Try logging in.", "error")
            cur.close()
            conn.close()
            return render_template('signup.html')

        # password_hash = generate_password_hash(password)  # Uncomment in production

        cur.execute("""
            INSERT INTO users (fullname, email, password_hash, location, user_type)
            VALUES (%s, %s, %s, %s, %s)
        """, (fullname, email, password, location, user_type))  # use password_hash in production
        conn.commit()
        cur.close()
        conn.close()

        flash("Signup successful. Please login.", "success")
        return redirect(url_for('auth.login_page'))

    return render_template('signup.html')


# ------------------ LOGIN ------------------
@auth_bp.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        if not conn:
            flash("Database connection failed.", "error")
            return render_template('login.html')

        cur = conn.cursor()
        cur.execute("SELECT id, fullname, user_type, password_hash FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            user_id, fullname, user_type, db_password = user

            # if check_password_hash(db_password, password):  # Production
            if password == db_password:  # Dev only
                session['user_id'] = user_id
                session['fullname'] = fullname
                session['email'] = email
                session['user_type'] = user_type

                # Redirect based on role
                if user_type == 'farmer':
                    return redirect(url_for('farmer.dashboard'))
                elif user_type == 'consumer':
                    return redirect(url_for('recommendation.new_customer_recommendation'))  # Or your consumer dashboard
                elif user_type == 'admin':
                    return redirect(url_for('admin.dashboard'))  # Admin dashboard

                return redirect(url_for('home'))  # Fallback

            else:
                flash('Incorrect password.', 'error')
        else:
            flash('Email not found.', 'error')

    return render_template('login.html')


# ------------------ LOGOUT ------------------
@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))
