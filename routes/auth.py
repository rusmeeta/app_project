from flask import Blueprint, render_template, request, redirect, url_for, session
import psycopg2

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="kisanlink_db",
    user="kisanlink_user",
    password="password123",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# Signup
@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup_page():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        role = 'new_customer'
        cur.execute("INSERT INTO users (username, password, role) VALUES (%s, %s, %s)", (username, password, role))
        conn.commit()
        return redirect(url_for('auth.login_page'))
    return render_template('signup.html')

# Login
@auth_bp.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cur.execute("SELECT id, role FROM users WHERE username=%s AND password=%s", (username, password))
        user = cur.fetchone()
        if user:
            session['user_id'] = user[0]
            session['username'] = username
            session['role'] = user[1]
            return redirect(url_for('home'))
        else:
            return "Invalid credentials"
    return render_template('login.html')

# Logout
@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))
