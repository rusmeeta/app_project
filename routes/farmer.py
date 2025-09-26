from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from db import get_db_connection
import os
from werkzeug.utils import secure_filename

farmer_bp = Blueprint('farmer', __name__, url_prefix='/farmer')

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ------------------- Dashboard -------------------
@farmer_bp.route('/dashboard')
def dashboard():
    if session.get('user_type') != 'farmer':
        return "Unauthorized", 403

    user_id = session.get('user_id')
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch farmer profile
    cur.execute("SELECT fullname, email FROM users WHERE id = %s", (user_id,))
    profile = cur.fetchone()

    # Dummy data for dashboard metrics
    sales_today = 0
    sales_7_days = 290
    sales_30_days = 12503

    cur.close()
    conn.close()

    return render_template('farmer/dashboard.html', profile=profile,
                           sales_today=sales_today, sales_7_days=sales_7_days,
                           sales_30_days=sales_30_days)

# ------------------- Upload Product -------------------
@farmer_bp.route('/upload', methods=['GET', 'POST'])
def upload():
    if session.get('user_type') != 'farmer':
        return "Unauthorized", 403

    user_id = session.get('user_id')

    if request.method == 'POST':
        item_name = request.form.get('item_name')
        price = request.form.get('price')
        location = request.form.get('location')
        photo = request.files.get('photo')

        if not item_name or not price or not location or not photo:
            flash('Please fill out all fields and upload a photo.', 'error')
        elif not allowed_file(photo.filename):
            flash('Invalid file type. Allowed types: png, jpg, jpeg, gif', 'error')
        else:
            filename = secure_filename(photo.filename)
            photo_path = os.path.join(UPLOAD_FOLDER, filename)
            photo.save(photo_path)

            conn = get_db_connection()
            cur = conn.cursor()

            cur.execute(
                "INSERT INTO farmer_items (farmer_id, item_name, price, photo_path, location) VALUES (%s, %s, %s, %s, %s)",
                (user_id, item_name, price, filename, location)
            )
            conn.commit()
            cur.close()
            conn.close()

            flash('Item listed successfully!', 'success')
            return redirect(url_for('farmer.items'))

    return render_template('farmer/upload.html')

# ------------------- Listed Items -------------------
@farmer_bp.route('/items')
def items():
    if session.get('user_type') != 'farmer':
        return "Unauthorized", 403

    user_id = session.get('user_id')

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT item_name, price, photo_path, location FROM farmer_items WHERE farmer_id = %s", (user_id,))
    items = cur.fetchall()

    cur.close()
    conn.close()

    return render_template('farmer/items.html', items=items)


@farmer_bp.route('/reports')
def reports():
    if session.get('user_type') != 'farmer':
        return "Unauthorized", 403

    # Optional: Generate stats/report data
    return render_template('farmer/reports.html')
