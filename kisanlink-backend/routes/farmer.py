import os
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from db import get_db_connection

farmer_bp = Blueprint("farmer", __name__)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Map location names to coordinates
location_coords = {
    "Naya Thimi": (27.6943, 85.3347),
    "Gatthaghar": (27.6739136, 85.3739132),
    "Kausaltar": (27.6745787, 85.3642978),
    "Lokanthali": (27.6740, 85.3450),
}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve uploaded images
@farmer_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Add product
@farmer_bp.route("/add-product", methods=["POST"])
def add_product():
    try:
        item_name = request.form.get("item_name")
        price = float(request.form.get("price"))
        location = request.form.get("location")
        min_order_qty = int(request.form.get("min_order_qty"))
        available_stock = int(request.form.get("available_stock"))
        farmer_id = int(request.form.get("farmer_id"))
        photo = request.files.get("photo")

        if not all([item_name, price, location, min_order_qty, available_stock, farmer_id, photo]):
            return jsonify({"error": "All fields including photo are required"}), 400

        if not allowed_file(photo.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(photo.filename)
        photo.save(os.path.join(UPLOAD_FOLDER, filename))

        # Get latitude & longitude from location
        latitude, longitude = location_coords.get(location, (None, None))

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

# Get products for a farmer
@farmer_bp.route("/products/<int:farmer_id>", methods=["GET"])
def get_products(farmer_id):
    try:
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

# Delete product
@farmer_bp.route("/delete-product/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM farmer_items WHERE id=%s", (product_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update product
@farmer_bp.route("/update-product/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Fetch existing product
        cur.execute("SELECT * FROM farmer_items WHERE id=%s", (product_id,))
        product = cur.fetchone()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Form data
        item_name = request.form.get("item_name")
        price = float(request.form.get("price"))
        location = request.form.get("location")
        min_order_qty = int(request.form.get("min_order_qty"))
        available_stock = int(request.form.get("available_stock"))

        # Handle photo
        old_photo_filename = product[4]  # existing photo_path
        photo = request.files.get("photo")
        if photo and allowed_file(photo.filename):
            filename = secure_filename(photo.filename)
            photo.save(os.path.join(UPLOAD_FOLDER, filename))
            photo_to_save = filename
        else:
            photo_to_save = old_photo_filename

        # Get latitude & longitude from location
        latitude, longitude = location_coords.get(location, (None, None))

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