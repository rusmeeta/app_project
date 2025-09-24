from flask import Blueprint, render_template, session
import psycopg2

recommendation_bp = Blueprint('recommendation', __name__, url_prefix='/recommendation')

# PostgreSQL connection
conn = psycopg2.connect(
    dbname="kisanlink_db",
    user="kisanlink_user",
    password="password123",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# Old customer (personalized)
@recommendation_bp.route('/old_customer')
def old_customer_recommendation():
    if 'user_id' not in session:
        return "Please login first"
    user_id = session['user_id']
    cur.execute("SELECT product_name, description FROM recommendations WHERE user_id=%s", (user_id,))
    recommendations = cur.fetchall()
    return render_template('old_customer.html', recommendations=recommendations)

# New customer (general)
@recommendation_bp.route('/new_customer')
def new_customer_recommendation():
    cur.execute("SELECT product_name, description FROM recommendations LIMIT 10")
    products = cur.fetchall()
    return render_template('new_customer.html', products=products)
