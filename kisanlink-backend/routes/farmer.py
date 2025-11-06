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
        # Get form data
        item_name = request.form.get('item_name')
        price = request.form.get('price')
        min_order_qty = request.form.get('min_order_qty')
        available_stock = request.form.get('available_stock')
        location = request.form.get('specific_location')
        photo = request.files.get('photo')

        # Validation
        errors = []
        if not item_name:
            errors.append("Item Name is required.")
        if not price:
            errors.append("Price per kg is required.")
        if not min_order_qty:
            errors.append("Minimum Order Quantity is required.")
        if not available_stock:
            errors.append("Available Stock is required.")
        if not location:
            errors.append("Specific Location is required.")
        if not photo or photo.filename == '':
            errors.append("Please upload a photo.")
        elif not allowed_file(photo.filename):
            errors.append("Invalid file type. Allowed: png, jpg, jpeg, gif.")

        if errors:
            for e in errors:
                flash(e, 'error')
            return render_template('farmer/upload.html')

        # Save photo
        filename = secure_filename(photo.filename)
        photo_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(photo_path):
            import time
            name, ext = os.path.splitext(filename)
            filename = f"{name}_{int(time.time())}{ext}"
            photo_path = os.path.join(UPLOAD_FOLDER, filename)
        photo.save(photo_path)

        # Insert into DB
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO farmer_items 
                (farmer_id, item_name, price, min_order_qty, available_stock, location, photo_path)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (user_id, item_name, price, min_order_qty, available_stock, location, filename))
            conn.commit()
            cur.close()
            flash('Item listed successfully!', 'success')
            return redirect(url_for('farmer.items'))
        except Exception as ex:
            flash('An error occurred while saving the item. Please try again.', 'error')
            if conn:
                conn.rollback()
        finally:
            if conn:
                conn.close()

    # GET request
    return render_template('farmer/upload.html')

# ------------------- Listed Items -------------------
@farmer_bp.route('/items')
def items():
    if session.get('user_type') != 'farmer':
        return "Unauthorized", 403

    user_id = session.get('user_id')

    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch all columns required for template
    cur.execute("""
        SELECT id, item_name, price, location, min_order_qty, available_stock, photo_path
        FROM farmer_items
        WHERE farmer_id = %s
    """, (user_id,))
    items = cur.fetchall()

    cur.close()
    conn.close()

    return render_template('farmer/items.html', items=items)

# ------------------- Edit Item -------------------
@farmer_bp.route('/edit_item/<int:item_id>', methods=['GET', 'POST'])
def edit_item(item_id):
    if session.get('user_type') != 'farmer':
        return "Unauthorized", 403

    user_id = session.get('user_id')
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch the product to edit
    cur.execute("""
        SELECT id, item_name, price, min_order_qty, available_stock, location, photo_path
        FROM farmer_items
        WHERE id=%s AND farmer_id=%s
    """, (item_id, user_id))
    item = cur.fetchone()

    if not item:
        flash("Item not found.", "error")
        return redirect(url_for('farmer.items'))

    if request.method == 'POST':
        # Update fields
        item_name = request.form.get('item_name')
        price = request.form.get('price')
        min_order_qty = request.form.get('min_order_qty')
        available_stock = request.form.get('available_stock')
        location = request.form.get('location')

        cur.execute("""
            UPDATE farmer_items
            SET item_name=%s, price=%s, min_order_qty=%s, available_stock=%s, location=%s
            WHERE id=%s AND farmer_id=%s
        """, (item_name, price, min_order_qty, available_stock, location, item_id, user_id))
        conn.commit()
        flash("Item updated successfully!", "success")
        cur.close()
        conn.close()
        return redirect(url_for('farmer.items'))

    cur.close()
    conn.close()
    return render_template('farmer/edit_item.html', item=item)


# ------------------- Delete Item -------------------
@farmer_bp.route('/delete_item/<int:item_id>', methods=['POST'])
def delete_item(item_id):
    if session.get('user_type') != 'farmer':
        return "Unauthorized", 403

    user_id = session.get('user_id')
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM farmer_items WHERE id=%s AND farmer_id=%s", (item_id, user_id))
    conn.commit()
    cur.close()
    conn.close()
    flash("Item deleted successfully!", "success")
    return redirect(url_for('farmer.items'))


@farmer_bp.route('/reports')
def reports():
    if session.get('user_type') != 'farmer':
        return "Unauthorized", 403

    # Optional: Generate stats/report data
    return render_template('farmer/reports.html')
