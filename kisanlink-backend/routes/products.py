from flask import Blueprint, jsonify
from db import get_db_connection

products_bp = Blueprint("products_bp", __name__)

@products_bp.route("/farmer-items", methods=["GET"])
def get_farmer_items():
    conn = get_db_connection()
    cur = conn.cursor()

    # Join farmer_items with users table to get farmer name and coordinates
    cur.execute("""
        SELECT fi.id, fi.farmer_id, fi.item_name, fi.price, fi.photo_path, fi.location,
               fi.min_order_qty, fi.available_stock,
               u.fullname AS farmer_name, u.latitude AS farmer_lat, u.longitude AS farmer_lon
        FROM farmer_items fi
        JOIN users u ON u.id = fi.farmer_id
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
            "farmer_name": row[8],
            "farmer_lat": row[9],
            "farmer_lon": row[10]
        })
    return jsonify(items)
