from flask import Blueprint, request, jsonify
import psycopg2
from math import radians, cos, sin, asin, sqrt

products_bp = Blueprint("products_bp", __name__)

# Predefined location coordinates (fallback)
location_coords = {
    "Naya Thimi": (27.6943, 85.3347),
    "Gatthaghar": (27.6739136, 85.3739132),
    "Kausaltar": (27.6745787, 85.3642978),
    "Lokanthali": (27.6740, 85.3450),
}

# Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371  # km
    return c * r

@products_bp.route("/products-with-distance", methods=["POST"])
def products_with_distance():
    data = request.get_json()
    consumer_lat = float(data.get("latitude"))
    consumer_lon = float(data.get("longitude"))

    # Connect to DB
    conn = psycopg2.connect(
        dbname="kisanlink_db",
        user="kisanlink_user",
        password="password123",
        host="localhost"
    )
    cur = conn.cursor()
    
    # Join with users table instead of non-existent farmers table
    cur.execute("""
        SELECT fi.id, fi.item_name, fi.price, fi.photo_path, fi.location,
               fi.latitude, fi.longitude, u.fullname
        FROM farmer_items fi
        JOIN users u ON fi.farmer_id = u.id
        WHERE u.user_type='farmer'
    """)
    
    rows = cur.fetchall()
    cur.close()
    conn.close()

    products = []
    for row in rows:
        prod_id, name, price, image, location_text, lat, lon, farmer_name = row

        # Determine coordinates
        if lat is not None and lon is not None:
            farmer_lat, farmer_lon = lat, lon
        else:
            key = location_text.split()[0].capitalize()
            farmer_lat, farmer_lon = location_coords.get(key, (None, None))

        # Calculate distance if coordinates exist
        if farmer_lat is not None and farmer_lon is not None:
            distance = round(haversine(consumer_lat, consumer_lon, farmer_lat, farmer_lon), 2)
        else:
            distance = None  # unknown

        products.append({
            "id": prod_id,
            "name": name,
            "price": price,
            "image": image,
            "farmer": farmer_name,
            "distance": distance,
            "location": location_text
        })

    # Sort: nearest first, unknown distances at the end
    products.sort(key=lambda x: x["distance"] if x["distance"] is not None else 9999)

    return jsonify(products)
