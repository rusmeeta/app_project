from flask import Blueprint, render_template, request, redirect, url_for, session
import psycopg2

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# PostgreSQL connection
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
        fullname = request.form['fullname']
        email = request.form['email']
        password = request.form['password']
        location = request.form['location']
        user_type = request.form['user_type']

        cur.execute("""
            INSERT INTO users (fullname, email, password_hash, location, user_type)
            VALUES (%s, %s, %s, %s, %s)
        """, (fullname, email, password, location, user_type))
        conn.commit()

        return redirect(url_for('auth.login_page'))

    return render_template('signup.html')


# Login
@auth_bp.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        cur.execute("SELECT id, fullname, user_type FROM users WHERE email=%s AND password_hash=%s",
                    (email, password))
        user = cur.fetchone()

        if user:
            session['user_id'] = user[0]
            session['fullname'] = user[1]
            session['user_type'] = user[2]
            return redirect(url_for('home'))
        else:
            return "Invalid credentials"

    return render_template('login.html')


# Logout
@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))
