from flask import Blueprint, request, jsonify
from extensions import db
from utils.distance import haversine

consumer_bp = Blueprint("consumer", __name__)

@consumer_bp.route('/nearby-products', methods=['GET'])
def nearby_products():
    # 1. Get consumer location from frontend
    try:
        consumer_lat = float(request.args.get("lat"))
        consumer_lon = float(request.args.get("lon"))
    except:
        return jsonify({"error": "Invalid coordinates"}), 400

    # 2. Fetch all farmer_items + farmer location
    query = """
        SELECT fi.*, u.fullname AS farmer_name, u.latitude AS farmer_lat, u.longitude AS farmer_lon
        FROM farmer_items fi
        JOIN users u ON fi.farmer_id = u.id
    """
    result = db.session.execute(query)

    # 3. Calculate distance for each product
    items = []
    for row in result:
        distance_km = haversine(consumer_lat, consumer_lon, row.farmer_lat, row.farmer_lon)
        items.append({
            "id": row.id,
            "item_name": row.item_name,
            "price": row.price,
            "photo_path": row.photo_path,
            "location": row.location,
            "min_order_qty": row.min_order_qty,
            "available_stock": row.available_stock,
            "farmer_name": row.farmer_name,
            "distance": round(distance_km, 2)  # km
        })

    # 4. Sort by distance ascending
    items.sort(key=lambda x: x["distance"])
    return jsonify(items)
