from flask import Blueprint, request, jsonify
from models_consumer import Consumer, ConsumerPurchaseHistory
from db import db
import math

recommend_bp = Blueprint("recommend", __name__)

def calculate_distance(lat1, lon1, lat2, lon2):
    return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

@recommend_bp.route("/products/<int:consumer_id>")
def recommend_products(consumer_id):
    consumer = Consumer.query.get(consumer_id)

    # check login count
    is_old = consumer.login_count > 1

    # check purchase history
    history = ConsumerPurchaseHistory.query.filter_by(consumer_id=consumer_id).all()

    if is_old and len(history) > 0:
        # recommend based on purchased products
        product_ids = [h.product_id for h in history]
        return jsonify({"recommendation_type": "history", "products": product_ids})

    # fallback: recommend based on nearby farmers
    from psycopg2 import connect
    conn = connect(host="localhost", dbname="kisanlink", user="postgres", password="password")
    cur = conn.cursor()
    cur.execute("SELECT id, latitude, longitude FROM users WHERE user_type='farmer'")
    farmers = cur.fetchall()

    farmer_distances = []
    for f in farmers:
        dist = calculate_distance(consumer.latitude, consumer.longitude, f[1], f[2])
        farmer_distances.append((f[0], dist))

    farmer_distances = sorted(farmer_distances, key=lambda x: x[1])
    nearest_farmer_id = farmer_distances[0][0]

    cur.execute("SELECT * FROM products WHERE farmer_id = %s", (nearest_farmer_id,))
    products = cur.fetchall()

    return jsonify({
        "recommendation_type": "distance",
        "farmer_id": nearest_farmer_id,
        "products": products
    })
