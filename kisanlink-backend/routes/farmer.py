import os
from flask import Blueprint, request, jsonify, send_from_directory, session
from werkzeug.utils import secure_filename
from db import get_db_connection

# Create a Flask blueprint for farmer-related routes
farmer_bp = Blueprint("farmer", __name__)

# Directory where uploaded product images will be stored
UPLOAD_FOLDER = "uploads"
# Allowed file extensions for uploaded images
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# Create the uploads folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Mapping human-readable location names to latitude/longitude
location_coords = {
    "Naya Thimi": (27.6943, 85.3347),
    "Gatthaghar": (27.6739136, 85.3739132),
    "Kausaltar": (27.6745787, 85.3642978),
    "Lokanthali": (27.6740, 85.3450),
}

# Helper function to check if uploaded file has allowed extension
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve uploaded images from the server
@farmer_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ------------------ Farmer Info ------------------
@farmer_bp.route("/me", methods=["GET"])
def get_farmer_info():
    """
    Get the currently logged-in farmer's details
    """
    try:
        farmer_id = session.get("user_id")  # Get user ID from session
        if not farmer_id:
            return jsonify({"error": "Not logged in"}), 401

        conn = get_db_connection()
        cur = conn.cursor()
        # Fetch farmer details from users table
        cur.execute("""
            SELECT id, fullname, email, location, latitude, longitude, user_type
            FROM users
            WHERE id=%s
        """, (farmer_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return jsonify({"error": "Farmer not found"}), 404

        # Convert row to dict
        farmer = {
            "id": row[0],
            "fullname": row[1],
            "email": row[2],
            "location": row[3],
            "latitude": row[4],
            "longitude": row[5],
            "user_type": row[6]
        }

        return jsonify(farmer), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

# ------------------ Add Product ------------------
@farmer_bp.route("/add-product", methods=["POST"])
def add_product():
    """
    Add a new product for the logged-in farmer
    """
    try:
        farmer_id = session.get("user_id")
        if not farmer_id:
            return jsonify({"error": "Not logged in"}), 401

        # Get product data from form-data
        item_name = request.form.get("item_name")
        price = float(request.form.get("price"))
        location = request.form.get("location")
        min_order_qty = int(request.form.get("min_order_qty"))
        available_stock = int(request.form.get("available_stock"))
        photo = request.files.get("photo")

        # Validate all fields
        if not all([item_name, price, location, min_order_qty, available_stock, photo]):
            return jsonify({"error": "All fields including photo are required"}), 400

        # Validate file type
        if not allowed_file(photo.filename):
            return jsonify({"error": "Invalid file type"}), 400

        # Secure filename and save photo
        filename = secure_filename(photo.filename)
        photo.save(os.path.join(UPLOAD_FOLDER, filename))

        # Get coordinates from location
        latitude, longitude = location_coords.get(location, (None, None))

        # Insert product into database
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO farmer_items
            (farmer_id, item_name, price, photo_path, location, min_order_qty, available_stock, latitude, longitude)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (farmer_id, item_name, price, filename, location, min_order_qty, available_stock, latitude, longitude))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Product added successfully"}), 201

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

# ------------------ Get Products ------------------
@farmer_bp.route("/products", methods=["GET"])
def get_products():
    """
    Get all products for the logged-in farmer
    """
    try:
        farmer_id = session.get("user_id")
        if not farmer_id:
            return jsonify({"error": "Not logged in"}), 401

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, item_name, price, photo_path, location, min_order_qty, available_stock, latitude, longitude
            FROM farmer_items
            WHERE farmer_id=%s
        """, (farmer_id,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        # Convert rows to list of dicts
        products = [
            {
                "id": r[0],
                "item_name": r[1],
                "price": r[2],
                "photo_path": r[3],
                "location": r[4],
                "min_order_qty": r[5],
                "available_stock": r[6],
                "latitude": r[7],
                "longitude": r[8]
            } for r in rows
        ]

        return jsonify({"products": products}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------ Update Product ------------------
@farmer_bp.route("/update-product/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    """
    Update a product for the logged-in farmer
    """
    try:
        farmer_id = session.get("user_id")
        if not farmer_id:
            return jsonify({"error": "Not logged in"}), 401

        conn = get_db_connection()
        cur = conn.cursor()
        # Fetch product to check ownership
        cur.execute("SELECT farmer_id, photo_path FROM farmer_items WHERE id=%s", (product_id,))
        product = cur.fetchone()
        if not product:
            return jsonify({"error": "Product not found"}), 404
        if product[0] != farmer_id:
            return jsonify({"error": "Unauthorized"}), 403

        # Get updated fields
        item_name = request.form.get("item_name")
        price = float(request.form.get("price"))
        location = request.form.get("location")
        min_order_qty = int(request.form.get("min_order_qty"))
        available_stock = int(request.form.get("available_stock"))

        old_photo = product[1]
        photo = request.files.get("photo")
        # Save new photo if uploaded, else keep old
        if photo and allowed_file(photo.filename):
            filename = secure_filename(photo.filename)
            photo.save(os.path.join(UPLOAD_FOLDER, filename))
            photo_to_save = filename
        else:
            photo_to_save = old_photo

        latitude, longitude = location_coords.get(location, (None, None))

        # Update product in database
        cur.execute("""
            UPDATE farmer_items
            SET item_name=%s, price=%s, location=%s, min_order_qty=%s, available_stock=%s, photo_path=%s, latitude=%s, longitude=%s
            WHERE id=%s
        """, (item_name, price, location, min_order_qty, available_stock, photo_to_save, latitude, longitude, product_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Product updated successfully"}), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

# ------------------ Delete Product ------------------
@farmer_bp.route("/delete-product/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """
    Delete a product for the logged-in farmer
    """
    try:
        farmer_id = session.get("user_id")
        if not farmer_id:
            return jsonify({"error": "Not logged in"}), 401

        conn = get_db_connection()
        cur = conn.cursor()
        # Check ownership
        cur.execute("SELECT farmer_id FROM farmer_items WHERE id=%s", (product_id,))
        product = cur.fetchone()
        if not product:
            return jsonify({"error": "Product not found"}), 404
        if product[0] != farmer_id:
            return jsonify({"error": "Unauthorized"}), 403

        # Delete product
        cur.execute("DELETE FROM farmer_items WHERE id=%s", (product_id,))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
