from flask import Blueprint, jsonify
from extensions import db  # your database connection

consumer_bp = Blueprint("consumer", __name__)

@consumer_bp.route("/available-products", methods=["GET"])
def available_products():
    try:
        sql = "SELECT * FROM farmer_items"
        result = db.session.execute(sql)

        products = []
        for row in result:
            products.append({
                "id": row.id,
                "farmer_id": row.farmer_id,
                "item_name": row.item_name,
                "price": float(row.price),
                "photo_path": row.photo_path,
                "location": row.location,
                "min_order_qty": row.min_order_qty,
                "available_stock": row.available_stock,
                "latitude": row.latitude,
                "longitude": row.longitude
            })

        return jsonify(products), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
