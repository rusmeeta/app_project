from flask import Blueprint, request, jsonify
from models_cart import CartItem
from db import db

cart_bp = Blueprint("cart", __name__)

@cart_bp.route("/", methods=["GET"])
def get_cart_items():
    items = CartItem.query.all()
    return jsonify([{
        "id": i.id,
        "consumer_id": i.consumer_id,
        "product_id": i.product_id,
        "quantity": i.quantity
    } for i in items])
