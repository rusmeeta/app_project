# routes/products.py
from flask import Blueprint, jsonify
from db import get_db_connection

products_bp = Blueprint("products_bp", __name__)

@products_bp.route("/farmer-items", methods=["GET"])
def get_farmer_items():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, farmer_id, item_name, price, photo_path, location, min_order_qty, available_stock, latitude, longitude
        FROM farmer_items
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    items = []
    for row in rows:
        items.append({
            "id": row[0],
            "farmer_id": row[1],
            "item_name": row[2],
            "price": row[3],
            "photo_path": row[4],
            "location": row[5],
            "min_order_qty": row[6],
            "available_stock": row[7],
            "latitude": row[8],
            "longitude": row[9]
        })
    return jsonify(items)
